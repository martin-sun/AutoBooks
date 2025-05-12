"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  fetchFiscalYears,
  FiscalYear,
  fetchCurrentFiscalYear,
} from "@/lib/api/fiscal-years";
import { Button } from "@/components/ui/Button";
import { CalendarIcon } from "lucide-react";

interface FiscalYearSelectorProps {
  workspaceId: string;
  onChange?: (fiscalYear: FiscalYear) => void;
  className?: string;
}

export function FiscalYearSelector({
  workspaceId,
  onChange,
  className = "",
}: FiscalYearSelectorProps) {
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!workspaceId) return;

    const loadFiscalYears = async () => {
      try {
        setLoading(true);
        // 获取所有财政年度
        const years = await fetchFiscalYears(workspaceId);
        setFiscalYears(years);

        // 获取当前财政年度
        const currentYear = await fetchCurrentFiscalYear(workspaceId);
        if (currentYear) {
          setSelectedYearId(currentYear.id || "");
          if (onChange) onChange(currentYear);
        } else if (years.length > 0) {
          // 如果没有设置当前财政年度，使用最新的一个
          setSelectedYearId(years[0].id || "");
          if (onChange) onChange(years[0]);
        }
      } catch (error) {
        console.error("Error loading fiscal years:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFiscalYears();
  }, [workspaceId, onChange]);

  const handleFiscalYearChange = (fiscalYearId: string) => {
    const fiscalYear = fiscalYears.find((year) => year.id === fiscalYearId);
    if (!fiscalYear) return;

    setSelectedYearId(fiscalYearId);

    if (onChange) {
      onChange(fiscalYear);
    }

    // 把当前选中的财政年度ID添加到URL查询参数
    const url = new URL(window.location.href);
    url.searchParams.set("fiscalYearId", fiscalYearId);

    // 使用Next.js Router更新URL，不刷新页面
    router.push(pathname + "?" + url.searchParams.toString());
  };

  if (loading) {
    return (
      <div className={`fiscal-year-selector ${className}`}>
        <Button variant="outline" disabled className="h-9 px-3">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>加载中...</span>
        </Button>
      </div>
    );
  }

  if (fiscalYears.length === 0) {
    return (
      <div className={`fiscal-year-selector ${className}`}>
        <Button variant="outline" disabled className="h-9 px-3">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>无财政年度</span>
        </Button>
      </div>
    );
  }

  // 找到当前选中的财政年度
  const selectedYear = fiscalYears.find((year) => year.id === selectedYearId);

  return (
    <div className={`fiscal-year-selector ${className}`}>
      <select
        value={selectedYearId}
        onChange={(e) => handleFiscalYearChange(e.target.value)}
        className="h-9 px-3 border rounded-md flex items-center w-[200px]"
      >
        <option value="" disabled>
          {selectedYear?.name || "选择财政年度"}
        </option>
        {fiscalYears.map((year) => (
          <option key={year.id} value={year.id || ""}>
            {year.name} {year.is_current && "(Current)"}
          </option>
        ))}
      </select>
    </div>
  );
}
