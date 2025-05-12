"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { format } from "date-fns";
import { PlusIcon } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label/index";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  fetchFiscalYears,
  createFiscalYear,
  updateFiscalYear,
  deleteFiscalYear,
  FiscalYear,
} from "@/lib/api/fiscal-years";

export default function FiscalYearSettings() {
  const params = useParams() || {};
  const workspaceId = params.workspace_id as string;

  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New fiscal year form state
  const [showNewYearForm, setShowNewYearForm] = useState(false);
  const [newFiscalYear, setNewFiscalYear] = useState<FiscalYear>({
    workspace_id: workspaceId,
    name: `FY ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    start_date: format(new Date(new Date().getFullYear(), 0, 1), "yyyy-MM-dd"),
    end_date: format(new Date(new Date().getFullYear(), 11, 31), "yyyy-MM-dd"),
    status: "active",
    is_current: false,
  });

  // Get workspace fiscal year settings and existing fiscal years
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const years = await fetchFiscalYears(workspaceId);
        setFiscalYears(years);
      } catch (error) {
        console.error("Error loading fiscal year settings:", error);
        toast.error("加载设置失败");
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId) {
      loadData();
    }
  }, [workspaceId]);

  // Add new fiscal year
  const handleAddFiscalYear = async () => {
    try {
      setSaving(true);

      const fiscalYearData: FiscalYear = {
        workspace_id: workspaceId,
        name: newFiscalYear.name,
        start_date: newFiscalYear.start_date,
        end_date: newFiscalYear.end_date,
        status: newFiscalYear.status,
        is_current: fiscalYears.length === 0, // If this is the first fiscal year, set it as current
      };

      await createFiscalYear(fiscalYearData);

      // Refresh fiscal year list
      const updatedYears = await fetchFiscalYears(workspaceId);
      setFiscalYears(updatedYears);

      // Reset form
      setShowNewYearForm(false);
      setNewFiscalYear({
        workspace_id: workspaceId,
        name: `FY ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        start_date: format(
          new Date(new Date().getFullYear(), 0, 1),
          "yyyy-MM-dd"
        ),
        end_date: format(
          new Date(new Date().getFullYear(), 11, 31),
          "yyyy-MM-dd"
        ),
        status: "active",
        is_current: false,
      });

      toast.success("New fiscal year added");
    } catch (error) {
      console.error("Error adding fiscal year:", error);
      toast.error("Failed to add fiscal year");
    } finally {
      setSaving(false);
    }
  };

  // Change fiscal year status
  const handleChangeYearStatus = async (
    fiscalYearId: string,
    status: "active" | "closed" | "filed"
  ) => {
    try {
      await updateFiscalYear(fiscalYearId, { status });

      // 更新本地状态
      setFiscalYears((prev) =>
        prev.map((year) =>
          year.id === fiscalYearId ? { ...year, status } : year
        )
      );

      toast.success("Fiscal year status updated");
    } catch (error) {
      console.error("Error updating fiscal year status:", error);
      toast.error("Failed to update fiscal year status");
    }
  };

  // 删除财政年度
  const handleDeleteFiscalYear = async (fiscalYearId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this fiscal year? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteFiscalYear(fiscalYearId);

      // 更新本地状态
      setFiscalYears((prev) => prev.filter((year) => year.id !== fiscalYearId));

      toast.success("Fiscal year deleted");
    } catch (error) {
      console.error("Error deleting fiscal year:", error);
      toast.error("Failed to delete fiscal year");
    }
  };

  // 编辑财政年度
  const [editingFiscalYear, setEditingFiscalYear] = useState<FiscalYear | null>(
    null
  );

  const handleEditFiscalYear = (year: FiscalYear) => {
    setEditingFiscalYear(year);
  };

  const handleUpdateFiscalYear = async () => {
    if (!editingFiscalYear) return;

    try {
      setSaving(true);
      await updateFiscalYear(editingFiscalYear.id!, editingFiscalYear);

      // 更新本地状态
      setFiscalYears((prev) =>
        prev.map((year) =>
          year.id === editingFiscalYear.id ? editingFiscalYear : year
        )
      );

      setEditingFiscalYear(null);
      toast.success("Fiscal year updated");
    } catch (error) {
      console.error("Error updating fiscal year:", error);
      toast.error("Failed to update fiscal year");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Fiscal Year Settings</h1>

      {/* 财政年度管理 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Fiscal Year Management</CardTitle>
            <CardDescription>
              Manage specific fiscal years for your workspace. While the default
              settings provide templates, here you can create and manage
              individual fiscal year periods for accounting purposes.
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => setShowNewYearForm(!showNewYearForm)}
            variant="outline"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Fiscal Year
          </Button>
        </CardHeader>
        <CardContent>
          {/* Add New Fiscal Year Form */}
          {showNewYearForm && (
            <div className="border rounded-md p-4 mb-4 space-y-4">
              <h3 className="font-medium">Add New Fiscal Year</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-fiscal-year-name">Name</Label>
                  <Input
                    id="new-fiscal-year-name"
                    value={newFiscalYear.name}
                    onChange={(e) =>
                      setNewFiscalYear({
                        ...newFiscalYear,
                        name: e.target.value,
                      })
                    }
                    placeholder="Example: FY 2025-2026"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="new-fiscal-year-status">Status</Label>
                    <div className="relative group">
                      <span className="cursor-help text-gray-500 hover:text-gray-700">
                        <span className="inline-flex items-center justify-center rounded-full border border-gray-300 px-1.5">
                          ❕
                        </span>
                        <div className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-md bg-black p-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                          <p>
                            <strong>Active:</strong> Current fiscal year in use
                          </p>
                          <p>
                            <strong>Closed:</strong> Fiscal year that has ended
                            but not yet filed with authorities
                          </p>
                          <p>
                            <strong>Filed:</strong> Fiscal year that has been
                            officially reported and filed
                          </p>
                        </div>
                      </span>
                    </div>
                  </div>
                  <Select
                    value={newFiscalYear.status}
                    onValueChange={(value) =>
                      setNewFiscalYear({
                        ...newFiscalYear,
                        status: value as "active" | "closed" | "filed",
                      })
                    }
                  >
                    <SelectTrigger id="new-fiscal-year-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="filed">Filed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-fiscal-year-start-date">Start Date</Label>
                  <div className="relative">
                    <input
                      type="date"
                      id="new-fiscal-year-start-date"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newFiscalYear.start_date}
                      onChange={(e) =>
                        setNewFiscalYear({
                          ...newFiscalYear,
                          start_date: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-fiscal-year-end-date">End Date</Label>
                  <div className="relative">
                    <input
                      type="date"
                      id="new-fiscal-year-end-date"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newFiscalYear.end_date}
                      onChange={(e) =>
                        setNewFiscalYear({
                          ...newFiscalYear,
                          end_date: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowNewYearForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddFiscalYear}
                  disabled={
                    saving ||
                    !newFiscalYear.name ||
                    !newFiscalYear.start_date ||
                    !newFiscalYear.end_date
                  }
                >
                  {saving ? "Adding..." : "Add Fiscal Year"}
                </Button>
              </div>
            </div>
          )}

          {/* 编辑财政年度弹窗 */}
          {editingFiscalYear && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-medium mb-4">Edit Fiscal Year</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-fiscal-year-name">Name</Label>
                    <Input
                      id="edit-fiscal-year-name"
                      value={editingFiscalYear.name}
                      onChange={(e) =>
                        setEditingFiscalYear({
                          ...editingFiscalYear,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-fiscal-year-start-date">
                      Start Date
                    </Label>
                    <div className="relative">
                      <input
                        type="date"
                        id="edit-fiscal-year-start-date"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={editingFiscalYear.start_date}
                        onChange={(e) =>
                          setEditingFiscalYear({
                            ...editingFiscalYear,
                            start_date: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-fiscal-year-end-date">End Date</Label>
                    <div className="relative">
                      <input
                        type="date"
                        id="edit-fiscal-year-end-date"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={editingFiscalYear.end_date}
                        onChange={(e) =>
                          setEditingFiscalYear({
                            ...editingFiscalYear,
                            end_date: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="edit-fiscal-year-status">Status</Label>
                    </div>
                    <Select
                      value={editingFiscalYear.status}
                      onValueChange={(value) =>
                        setEditingFiscalYear({
                          ...editingFiscalYear,
                          status: value as "active" | "closed" | "filed",
                        })
                      }
                    >
                      <SelectTrigger id="edit-fiscal-year-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="filed">Filed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setEditingFiscalYear(null)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateFiscalYear} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Fiscal Year List */}
          {fiscalYears.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No fiscal years yet. Click &quot;Add Fiscal Year&quot; button to
              create a new fiscal year.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Name</th>
                    <th className="text-left py-2 px-4">Start Date</th>
                    <th className="text-left py-2 px-4">End Date</th>
                    <th className="text-left py-2 px-4">Status</th>
                    <th className="text-left py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fiscalYears.map((year) => (
                    <tr key={year.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">
                        {year.name}{" "}
                        {year.is_current && (
                          <span className="text-green-500 text-sm">
                            (Current)
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4">{year.start_date}</td>
                      <td className="py-2 px-4">{year.end_date}</td>
                      <td className="py-2 px-4">
                        <Select
                          value={year.status}
                          onValueChange={(value) =>
                            handleChangeYearStatus(
                              year.id!,
                              value as "active" | "closed" | "filed"
                            )
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                            <SelectItem value="filed">Filed</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditFiscalYear(year)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteFiscalYear(year.id!)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
