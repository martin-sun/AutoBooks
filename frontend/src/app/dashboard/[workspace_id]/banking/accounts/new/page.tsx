"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
// 不再使用自定义Select组件，改用原生select
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/toast/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, Save } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define form schema
const formSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  description: z.string().optional(),
  account_category: z.enum(["asset", "liability"], {
    required_error: "Please select an account category",
  }),
  chart_id: z.string().min(1, "Please select an account type"),
  opening_balance: z.coerce.number().default(0),
  currency: z.string().min(3, "Please select a currency").default("CAD"),
});

// Define form data type
type FormData = z.infer<typeof formSchema>;

// Chart of accounts interface definition
interface ChartOfAccount {
  id: string;
  name: string;
  type: string;
}

// Error interface definition
interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export default function NewBankAccountPage() {
  const params = useParams();
  const workspace_id = params?.workspace_id as string;
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [chartAccounts, setChartAccounts] = useState<ChartOfAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<ChartOfAccount[]>(
    []
  );

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      account_category: undefined,
      chart_id: "",
      opening_balance: 0,
      currency: "CAD",
    },
  });

  useEffect(() => {
    // Load chart of accounts for dropdown menu
    const loadChartAccounts = async () => {
      try {
        // 获取适合作为银行账户的资产和负债类型的账户
        const { data, error } = await supabase
          .from("chart_of_accounts")
          .select("id, name, type")
          .eq("workspace_id", workspace_id)
          .in("type", ["asset", "liability"])
          .eq("is_payment", true)
          .eq("is_deleted", false);

        if (error) throw error;

        // 确保data不是undefined
        const accounts = data || [];


        // 过滤掉父级账户类型（如"Assets"和"Liabilities"）
        const validAccounts = accounts.filter((account) => {
          // 过滤掉名称为"Assets"或"Liabilities"的父级账户
          return !["Assets", "Liabilities", "资产", "负债"].includes(
            account.name
          );
        });



        // 设置账户列表
        setChartAccounts(validAccounts);

        // 重置chart_id，因为我们现在使用两步选择
        form.setValue("chart_id", "");
      } catch (error: unknown) {
        console.error("Error loading chart accounts:", (error as SupabaseError).message);
        toast({
          title: "Failed to load account types",
          description:
            "Unable to load account type information. Please try again later.",
          variant: "destructive",
        });
      }
    };

    if (workspace_id) {
      loadChartAccounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace_id]);

  // 获取当前选择的账户类别
  const accountCategory = form.watch("account_category");

  // 当账户类别变化时，过滤账户列表
  useEffect(() => {


    if (accountCategory && chartAccounts.length > 0) {


      // 根据选择的类别过滤账户
      const accounts = chartAccounts.filter((account) => {
        const matches = account.type === accountCategory;

        return matches;
      });



      // 更新过滤后的账户列表
      setFilteredAccounts(accounts);

      // 重置chart_id
      form.setValue("chart_id", "");

      if (accounts.length === 0) {

      }
    } else {

      setFilteredAccounts([]);
    }
  }, [accountCategory, chartAccounts, form]);

  const onSubmit = async (values: FormData) => {
    try {
      setLoading(true);

      // 获取账户类型信息，用于错误处理
      let accountTypeInfo = "";
      try {
        const { data: chartData } = await supabase
          .from("chart_of_accounts")
          .select("name, type")
          .eq("id", values.chart_id)
          .single();
        
        if (chartData) {
          accountTypeInfo = `${chartData.name} (${chartData.type})`;
        }
      } catch (e) {
        // 忽略这里的错误，继续处理主要流程
      }

      // 确保开户余额是数值类型并且精确到两位小数
      // 使用parseFloat和toFixed来处理精度问题
      const rawBalance = parseFloat(values.opening_balance.toString());
      const openingBalance = parseFloat(rawBalance.toFixed(2));
      
      console.log("Creating bank account with params:", {
        name: values.name,
        chart_id: values.chart_id,
        account_type: accountTypeInfo,
        opening_balance: openingBalance,
        currency: values.currency
      });

      // Use RPC call to create bank account
      const { data, error } = await supabase.rpc("create_bank_account", {
        workspace_id_param: workspace_id,
        name_param: values.name,
        description_param: values.description || "",
        chart_id_param: values.chart_id,
        opening_balance_param: openingBalance,
        currency_param: values.currency,
      });

      if (error) {
        console.error("Supabase error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      toast({
        title: "Account created successfully",
        description: "Your bank account has been created successfully.",
      });

      // Redirect to account details page
      router.push(`/dashboard/${workspace_id}/banking/accounts/${data}`);
    } catch (error: unknown) {
      const errorMessage = (error as SupabaseError).message || "Unknown error";
      console.error("Error creating account:", errorMessage);
      
      // 提供更具体的错误信息
      let description = "Unable to create bank account. Please try again later.";
      
      // 处理特定错误类型
      if (errorMessage.includes("Transaction must be balanced")) {
        description = "Error with opening balance: Transaction must be balanced. Please try a different amount or contact support.";
      }
      
      toast({
        title: "Failed to create account",
        description: description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center">
        <Link href={`/dashboard/${workspace_id}/banking/accounts`}>
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add Bank Account</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Bank Account</CardTitle>
          <CardDescription>
            Add a new bank account to track your finances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Savings Account, Checking Account"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional information about the account"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="account_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Category</FormLabel>
                    <FormControl>
                      <select
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        onChange={(e) => {
                          // 当选择新的账户类别时，清空chart_id
                          form.setValue("chart_id", "");
                          // 更新account_category值
                          field.onChange(e.target.value);
                        }}
                        value={field.value || ""}
                      >
                        <option value="" disabled>
                          Select account category
                        </option>
                        <option value="asset">
                          Asset (Bank Account, Cash, etc.)
                        </option>
                        <option value="liability">
                          Liability (Credit Card, Loan, etc.)
                        </option>
                      </select>
                    </FormControl>
                    <FormDescription>
                      Select whether this is an asset (bank account) or
                      liability (credit card)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chart_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Type</FormLabel>
                    <FormControl>
                      <select
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        onChange={(e) => field.onChange(e.target.value)}
                        value={field.value}
                        disabled={!accountCategory}
                      >
                        <option value="" disabled>
                          Select account type
                        </option>
                        {filteredAccounts && filteredAccounts.length > 0 ? (
                          filteredAccounts.map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.name}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            {accountCategory
                              ? `No ${accountCategory} account types available`
                              : "Please select a category first"}
                          </option>
                        )}
                      </select>
                    </FormControl>
                    <FormDescription>
                      {accountCategory
                        ? `Select the specific ${accountCategory} type for this bank account`
                        : "Please select an account category first"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="opening_balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opening Balance</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        placeholder="0.00"
                        onChange={(e) => {
                          // 限制输入值的大小和精度
                          const value = e.target.value;
                          if (value === '') {
                            field.onChange(0);
                          } else {
                            const numValue = parseFloat(value);
                            if (!isNaN(numValue)) {
                              // 限制最大值为1,000,000
                              if (numValue > 1000000) {
                                field.onChange(1000000);
                              } else {
                                field.onChange(numValue);
                              }
                            }
                          }
                        }}
                        value={field.value}
                      />
                    </FormControl>
                    <FormDescription>
                      The initial balance of this account (maximum 1,000,000)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <select
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        onChange={(e) => field.onChange(e.target.value)}
                        value={field.value}
                      >
                        <option value="CAD">Canadian Dollar (CAD)</option>
                        <option value="USD">US Dollar (USD)</option>
                        <option value="CNY">Chinese Yuan (CNY)</option>
                        <option value="EUR">Euro (EUR)</option>
                      </select>
                    </FormControl>
                    <FormDescription>
                      The currency used for this account
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Link href={`/dashboard/${workspace_id}/banking/accounts`}>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading && (
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                  )}
                  <Save className="mr-2 h-4 w-4" />
                  Save Account
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
