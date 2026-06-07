import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, isBefore, startOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Utensils, Coffee, Apple, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';

import { getMealMenus, createMealMenu, getMealStatistics } from '../../services/operation.service';
import { MealMenuResponse, MealType, MealStatisticsResponse } from '../../types/operation.type';
import { cn } from '../../lib/utils';

// Schema for Meal Creation
const mealFormSchema = z.object({
  date: z.date({
    required_error: "Vui lòng chọn ngày",
  }),
  mealType: z.nativeEnum(MealType, {
    required_error: "Vui lòng chọn loại bữa ăn",
  }),
  description: z.string().min(1, "Vui lòng nhập mô tả chi tiết"),
  imageUrl: z.string().optional(),
});

type MealFormValues = z.infer<typeof mealFormSchema>;

const translateMealType = (type: MealType) => {
  switch (type) {
    case MealType.BREAKFAST: return 'Sáng';
    case MealType.LUNCH: return 'Trưa';
    case MealType.SNACK: return 'Xế';
    default: return type;
  }
};

const getMealTypeColor = (type: MealType) => {
  switch (type) {
    case MealType.BREAKFAST: return 'text-orange-500 bg-orange-100';
    case MealType.LUNCH: return 'text-blue-500 bg-blue-100';
    case MealType.SNACK: return 'text-purple-500 bg-purple-100';
    default: return 'text-gray-500 bg-gray-100';
  }
};

const Meals = () => {
  // Tab 1 States: Menu Management
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfWeek(new Date(), { weekStartsOn: 1 }),
    to: endOfWeek(new Date(), { weekStartsOn: 1 }),
  });
  const [menus, setMenus] = useState<MealMenuResponse[]>([]);
  const [isMenuLoading, setIsMenuLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Tab 2 States: Statistics
  const [statDateRange, setStatDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [stats, setStats] = useState<MealStatisticsResponse>({
    totalBreakfast: 0,
    totalLunch: 0,
    totalSnack: 0,
    totalMeals: 0
  });
  const [isStatLoading, setIsStatLoading] = useState(false);

  // Form setup
  const form = useForm<MealFormValues>({
    resolver: zodResolver(mealFormSchema),
    defaultValues: {
      description: "",
      imageUrl: "",
    },
  });

  // Fetch Menus
  const fetchMenus = async () => {
    if (!dateRange.from || !dateRange.to) return;
    setIsMenuLoading(true);
    try {
      const startStr = format(dateRange.from, 'yyyy-MM-dd');
      const endStr = format(dateRange.to, 'yyyy-MM-dd');
      const response = await getMealMenus(startStr, endStr);
      if (response.data) {
        setMenus(response.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi lấy danh sách thực đơn');
    } finally {
      setIsMenuLoading(false);
    }
  };

  // Fetch Stats
  const fetchStats = async () => {
    if (!statDateRange.from || !statDateRange.to) return;
    setIsStatLoading(true);
    try {
      const startStr = format(statDateRange.from, 'yyyy-MM-dd');
      const endStr = format(statDateRange.to, 'yyyy-MM-dd');
      const response = await getMealStatistics(startStr, endStr);
      if (response.data) {
        setStats(response.data);
      }
    } catch (error: any) {
      // Handle 404 gracefully as 0
      setStats({ totalBreakfast: 0, totalLunch: 0, totalSnack: 0, totalMeals: 0 });
    } finally {
      setIsStatLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, [dateRange]);

  useEffect(() => {
    fetchStats();
  }, [statDateRange]);

  // Handle Form Submit
  const onSubmit = async (data: MealFormValues) => {
    try {
      const formattedData = {
        date: format(data.date, 'yyyy-MM-dd'),
        mealType: data.mealType,
        description: data.description,
        imageUrl: data.imageUrl || null,
      };

      await createMealMenu(formattedData);
      toast.success('Thêm thực đơn thành công');
      setIsDialogOpen(false);
      form.reset();
      fetchMenus(); // Refresh table
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi thêm thực đơn');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Suất ăn</h1>
      </div>

      <Tabs defaultValue="menu" className="w-full space-y-4">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="menu">Quản lý Thực đơn</TabsTrigger>
          <TabsTrigger value="stats">Thống kê Nhà bếp</TabsTrigger>
        </TabsList>

        {/* TAB 1: MENU MANAGEMENT */}
        <TabsContent value="menu" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-[300px] justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                          {format(dateRange.to, "dd/MM/yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy")
                      )
                    ) : (
                      <span>Chọn khoảng thời gian</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range: any) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to });
                      } else if (range?.from) {
                        setDateRange({ from: range.from, to: range.from });
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm thực đơn
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Thêm Thực đơn Mới</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Ngày áp dụng</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy")
                                  ) : (
                                    <span>Chọn ngày</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => isBefore(startOfDay(date), startOfDay(new Date()))}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mealType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bữa ăn</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn bữa ăn" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={MealType.BREAKFAST}>Sáng</SelectItem>
                              <SelectItem value={MealType.LUNCH}>Trưa</SelectItem>
                              <SelectItem value={MealType.SNACK}>Xế</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mô tả món ăn</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Ví dụ: Phở bò, Sữa chua, Trái cây tráng miệng..." 
                              className="resize-none"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Link hình ảnh (Không bắt buộc)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                      <Button type="submit">Lưu Thực Đơn</Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Ngày</TableHead>
                    <TableHead className="w-[100px]">Bữa ăn</TableHead>
                    <TableHead>Mô tả chi tiết</TableHead>
                    <TableHead className="text-right">Hình ảnh</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isMenuLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">Đang tải dữ liệu...</TableCell>
                    </TableRow>
                  ) : menus.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Không có thực đơn nào trong khoảng thời gian này</TableCell>
                    </TableRow>
                  ) : (
                    menus.map((menu) => (
                      <TableRow key={menu.id}>
                        <TableCell className="font-medium">
                          {format(new Date(menu.date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-semibold",
                            getMealTypeColor(menu.mealType)
                          )}>
                            {translateMealType(menu.mealType)}
                          </span>
                        </TableCell>
                        <TableCell>{menu.description}</TableCell>
                        <TableCell className="text-right">
                          {menu.imageUrl ? (
                            <img 
                              src={menu.imageUrl} 
                              alt={menu.description} 
                              className="h-10 w-10 object-cover rounded-md inline-block border shadow-sm"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=No+Image';
                              }}
                            />
                          ) : (
                            <span className="text-muted-foreground text-sm italic">Không có</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: STATISTICS */}
        <TabsContent value="stats" className="space-y-6 pt-4">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm text-muted-foreground">Chọn khoảng thời gian:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="stat-date"
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !statDateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {statDateRange?.from ? (
                    statDateRange.to ? (
                      <>
                        {format(statDateRange.from, "dd/MM/yyyy")} -{" "}
                        {format(statDateRange.to, "dd/MM/yyyy")}
                      </>
                    ) : (
                      format(statDateRange.from, "dd/MM/yyyy")
                    )
                  ) : (
                    <span>Chọn khoảng thời gian</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={statDateRange?.from}
                  selected={{ from: statDateRange.from, to: statDateRange.to }}
                  onSelect={(range: any) => {
                    if (range?.from && range?.to) {
                      setStatDateRange({ from: range.from, to: range.to });
                    } else if (range?.from) {
                      setStatDateRange({ from: range.from, to: range.from });
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {isStatLoading ? (
            <div className="text-center py-10">Đang tải dữ liệu thống kê...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-800">
                    Tổng Sáng
                  </CardTitle>
                  <Coffee className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-orange-900">{stats.totalBreakfast}</div>
                  <p className="text-xs text-orange-700 mt-1">
                    suất ăn chuẩn bị
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">
                    Tổng Trưa
                  </CardTitle>
                  <Utensils className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-blue-900">{stats.totalLunch}</div>
                  <p className="text-xs text-blue-700 mt-1">
                    suất ăn chuẩn bị
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-800">
                    Tổng Xế
                  </CardTitle>
                  <Apple className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-purple-900">{stats.totalSnack}</div>
                  <p className="text-xs text-purple-700 mt-1">
                    suất ăn chuẩn bị
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm border-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-bold text-green-800">
                    Tổng Suất
                  </CardTitle>
                  <Users className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black text-green-900">{stats.totalMeals}</div>
                  <p className="text-xs font-medium text-green-700 mt-1">
                    tất cả các bữa trong ngày
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Meals;
