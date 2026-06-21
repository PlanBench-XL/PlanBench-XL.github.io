#!/usr/bin/env python3
"""Build the static data bundle for the PlanBench-XL project page."""

from __future__ import annotations

import json
import os
import re
import shutil
from collections import Counter
from pathlib import Path
from statistics import mean

import fitz


SITE_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE_ROOT = SITE_ROOT.parent / "Planning-with-Massive-Tools"
REPO_ROOT = Path(os.environ.get("PLANBENCH_SOURCE_ROOT", DEFAULT_SOURCE_ROOT)).resolve()
OUTPUT_PATH = SITE_ROOT / "assets" / "data" / "site-data.json"
RETAIL_ROOT = REPO_ROOT / "src" / "data" / "retail"
PAPER_RESULTS = REPO_ROOT / "paper" / "results" / "results.md"
MAIN_TABLE = REPO_ROOT / "paper" / "table" / "main_table.tex"
FIGURE_SOURCE = REPO_ROOT / "outputs" / "benchmark_summary" / "benchmark_comparison_retail.png"
FIGURE_DEST = SITE_ROOT / "assets" / "figures" / "benchmark_comparison_retail.png"
MAIN_FIGURE_SOURCE = REPO_ROOT / "paper" / "figures" / "LSToolBench.pdf"
MAIN_FIGURE_DEST = SITE_ROOT / "assets" / "figures" / "LSToolBench.pdf"
MAIN_FIGURE_PNG_DEST = SITE_ROOT / "assets" / "figures" / "LSToolBench.png"
TAKEAWAY_SOURCES = [
    {"path": REPO_ROOT / "paper" / "4experiment.tex", "scope": "Main text"},
    {"path": REPO_ROOT / "paper" / "5analysis.tex", "scope": "Main text"},
    {"path": REPO_ROOT / "paper" / "appendix.tex", "scope": "Appendix"},
]
TOOL_SOURCES = [
    ("baseline_tools.json", "gold"),
    ("noisy_tools.json", "noisy"),
    ("blocker_tools.json", "blocker"),
]


def read_json(path: Path):
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)


def read_text(path: Path) -> str:
    with open(path, encoding="utf-8") as handle:
        return handle.read()


def build_tools(raw_tools: list[dict], family: str) -> list[dict]:
    tools = []
    for tool in raw_tools:
        parameters = tool.get("parameters") or {}
        props = (parameters.get("properties") or {}) if isinstance(parameters, dict) else {}
        parameter_names = list(props.keys())
        record = {
            "name": tool.get("name", ""),
            "internal_tool_name": tool.get("internal_tool_name", ""),
            "description": tool.get("description", ""),
            "input_datatypes": tool.get("input_datatypes", []),
            "output_datatype": tool.get("output_datatype", ""),
            "parameters": parameters,
            "parameter_names": parameter_names,
            "input_arity": len(tool.get("input_datatypes", [])),
            "strict": bool(tool.get("strict", False)),
            "tool_family": family,
            "tool_type": tool.get("tool_type", ""),
            "noise_type": tool.get("noise_type", ""),
            "baseline_tool_name": tool.get("baseline_tool_name", ""),
        }
        search_fields = [
            record["name"],
            record["internal_tool_name"],
            record["description"],
            record["output_datatype"],
            record["tool_family"],
            record["tool_type"],
            record["noise_type"],
            record["baseline_tool_name"],
            *record["input_datatypes"],
            *record["parameter_names"],
        ]
        record["search_blob"] = " ".join(filter(None, search_fields)).lower()
        tools.append(record)
    return tools


def build_datatypes(raw_datatypes: list[dict]) -> list[dict]:
    datatypes = []
    for dtype in raw_datatypes:
        datatypes.append(
            {
                "name": dtype.get("name", ""),
                "category": dtype.get("category", ""),
                "value_type": dtype.get("value_type", ""),
                "description": dtype.get("description", ""),
                "example": dtype.get("example"),
                "aliases": dtype.get("aliases", []),
            }
        )
    return datatypes


def _find_table_lines(text: str, heading: str) -> list[str]:
    lines = text.splitlines()
    start = None
    for index, line in enumerate(lines):
        if line.strip() == heading:
            start = index + 1
            break
    if start is None:
        return []

    table_start = None
    for index in range(start, len(lines)):
        if lines[index].startswith("| Model |"):
            table_start = index
            break
        if lines[index].startswith("## "):
            break
    if table_start is None:
        return []

    table_lines: list[str] = []
    for index in range(table_start, len(lines)):
        line = lines[index]
        if line.startswith("|"):
            table_lines.append(line)
            continue
        if table_lines:
            break
    return table_lines


def _parse_markdown_table(table_lines: list[str]) -> list[dict]:
    if len(table_lines) < 3:
        return []
    header = [cell.strip() for cell in table_lines[0].strip().strip("|").split("|")]
    rows = []
    for line in table_lines[2:]:
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if len(cells) != len(header):
            continue
        rows.append(dict(zip(header, cells)))
    return rows


def _to_float(value: str) -> float:
    try:
        return float(value)
    except Exception:
        return 0.0


def _to_int_pair(value: str) -> tuple[int, int]:
    if "/" not in value:
        return 0, 0
    left, right = value.split("/", 1)
    try:
        return int(left), int(right)
    except Exception:
        return 0, 0


def _clean_latex_cell(value: str) -> str:
    value = value.strip()
    value = value.replace(r"\phantom{0}", "")
    value = value.replace(r"\%", "%")
    value = re.sub(r"\\(?:textbf|textit|underline)\{([^{}]*)\}", r"\1", value)
    value = value.strip("{} ")
    return value.strip()


def _parse_main_table_default() -> list[dict]:
    if not MAIN_TABLE.exists():
        return []

    rows: list[dict] = []
    text = read_text(MAIN_TABLE)
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line.startswith(r"\textit{") or "&" not in line:
            continue

        cells = [cell.strip() for cell in line.rstrip(r"\\").split("&")]
        if len(cells) != 8:
            continue

        model = _clean_latex_cell(cells[0])
        values = [_to_float(_clean_latex_cell(cell)) for cell in cells[1:]]
        rows.append(
            {
                "model": model,
                "accuracy": values[0],
                "egt_precision": values[1],
                "turns": values[2],
                "mean_edt": values[3],
                "search_call_ratio": values[4],
                "itcr": values[5],
                "uirr": values[6],
                "egt_recall": None,
                "evaluated_count": 327,
                "query_count": 327,
            }
        )
    return rows


def build_results() -> dict[str, list[dict]]:
    results = {}
    default_rows = _parse_main_table_default()
    if default_rows:
        results["default"] = default_rows
    return results


def build_sample_queries(queries: list[dict], tasks: list[dict]) -> list[dict]:
    task_by_id = {task["task_id"]: task for task in tasks}
    samples = []
    for query in queries[:6]:
        task = task_by_id.get(query["task_id"], {})
        path = task.get("one_available_path") or []
        samples.append(
            {
                "query_id": query["query_id"],
                "task_id": query["task_id"],
                "query_text": query["query_text"],
                "input_datatypes": query.get("input_datatypes", []),
                "target_datatype": query.get("target_datatype", ""),
                "path_length": len(path),
                "one_available_path": path,
            }
        )
    return samples


def build_sample_paths(queries: list[dict], tasks: list[dict]) -> list[dict]:
    query_by_task = {query["task_id"]: query for query in queries}
    samples = []
    for task in tasks[:6]:
        query = query_by_task.get(task["task_id"], {})
        path = task.get("one_available_path") or []
        samples.append(
            {
                "task_id": task["task_id"],
                "query_id": query.get("query_id", ""),
                "query_text": query.get("query_text", ""),
                "input_datatypes": task.get("input_datatypes", []),
                "target_datatype": task.get("target_datatype", ""),
                "steps": task.get("steps", len(path)),
                "path": path,
            }
        )
    return samples


def build_stats(tools: list[dict], datatypes: list[dict], queries: list[dict], tasks: list[dict]) -> dict:
    input_arities = [tool["input_arity"] for tool in tools]
    category_counts = Counter(dtype.get("category", "unknown") for dtype in datatypes)
    output_counts = Counter(tool["output_datatype"] for tool in tools if tool.get("output_datatype"))
    return {
        "total_tools": len(tools),
        "strict_tools": sum(1 for tool in tools if tool["strict"]),
        "total_datatypes": len(datatypes),
        "total_queries": len(queries),
        "total_tasks": len(tasks),
        "min_input_arity": min(input_arities) if input_arities else 0,
        "max_input_arity": max(input_arities) if input_arities else 0,
        "mean_input_arity": mean(input_arities) if input_arities else 0.0,
        "datatype_categories": sorted(category_counts),
        "datatype_category_counts": [
            {"name": name, "count": count} for name, count in sorted(category_counts.items())
        ],
        "top_outputs": [{"name": name, "count": count} for name, count in output_counts.most_common(8)],
    }


def _strip_commented_lines(text: str) -> str:
    return "\n".join(line for line in text.splitlines() if not line.lstrip().startswith("%"))


def _clean_latex_text(text: str) -> str:
    cleaned = re.sub(r"\\label\{[^}]+\}", "", text)
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned.strip()


def _find_latest_headings(text: str, position: int) -> tuple[str | None, str | None]:
    current_section = None
    current_subsection = None
    pattern = re.compile(r"\\(section|subsection)\{([^}]*)\}")
    for match in pattern.finditer(text):
        if match.start() >= position:
            break
        kind, title = match.group(1), _clean_latex_text(match.group(2))
        if kind == "section":
            current_section = title
            current_subsection = None
        else:
            current_subsection = title
    return current_section, current_subsection


def build_takeaways() -> list[dict]:
    takeaways: list[dict] = []
    pattern = re.compile(r"\\begin\{takeaway\}(.*?)\\end\{takeaway\}", re.DOTALL)

    for source in TAKEAWAY_SOURCES:
        path = source["path"]
        scope = source["scope"]
        text = _strip_commented_lines(read_text(path))
        for match in pattern.finditer(text):
            body = _clean_latex_text(match.group(1))
            if not body:
                continue
            section, subsection = _find_latest_headings(text, match.start())
            if scope == "Appendix":
                source_label = subsection or section or path.stem
            else:
                source_label = section or path.stem
                if subsection:
                    source_label = f"{source_label} / {subsection}"
            takeaways.append(
                {
                    "scope": scope,
                    "source": source_label,
                    "text": body,
                }
            )
    return takeaways


def copy_figure_if_available() -> None:
    if not FIGURE_SOURCE.exists():
        return
    FIGURE_DEST.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(FIGURE_SOURCE, FIGURE_DEST)


def copy_main_figure_if_available() -> None:
    if not MAIN_FIGURE_SOURCE.exists():
        return
    MAIN_FIGURE_DEST.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(MAIN_FIGURE_SOURCE, MAIN_FIGURE_DEST)
    doc = fitz.open(MAIN_FIGURE_SOURCE)
    page = doc.load_page(0)
    pix = page.get_pixmap(matrix=fitz.Matrix(2.8, 2.8), alpha=False)
    pix.save(MAIN_FIGURE_PNG_DEST)
    doc.close()


def main() -> None:
    raw_datatypes = read_json(RETAIL_ROOT / "datatypes.json")
    queries = read_json(RETAIL_ROOT / "queries.json")
    tasks = read_json(RETAIL_ROOT / "tasks.json")

    tools = []
    for filename, family in TOOL_SOURCES:
        tools.extend(build_tools(read_json(RETAIL_ROOT / filename), family))
    datatypes = build_datatypes(raw_datatypes)
    results = build_results()
    copy_figure_if_available()
    copy_main_figure_if_available()

    site_data = {
        "stats": build_stats(tools, datatypes, queries, tasks),
        "tools": tools,
        "datatypes": datatypes,
        "datatype_names": sorted(dtype["name"] for dtype in datatypes),
        "results": results,
        "takeaways": build_takeaways(),
        "sample_queries": build_sample_queries(queries, tasks),
        "sample_paths": build_sample_paths(queries, tasks),
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as handle:
        json.dump(site_data, handle, ensure_ascii=True, indent=2)
        handle.write("\n")

    print(f"Wrote {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
