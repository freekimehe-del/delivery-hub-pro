import { useState } from "react";
import { useHSCodes, useCreateHSCode, type HSCode } from "@/hooks/useCustoms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, FileText, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const hsCodeSchema = z.object({
  code: z.string().min(4, "HS Code must be at least 4 characters"),
  description: z.string().min(1, "Description is required"),
  chapter: z.string().min(1, "Chapter is required"),
  duty_rate: z.coerce.number().min(0).max(100),
  sales_tax_rate: z.coerce.number().min(0).max(100).default(17),
  additional_duty_rate: z.coerce.number().min(0).max(100).optional(),
  regulatory_duty_rate: z.coerce.number().min(0).max(100).optional(),
  is_restricted: z.boolean().default(false),
  requires_license: z.boolean().default(false),
  notes: z.string().optional(),
});

type HSCodeFormData = z.infer<typeof hsCodeSchema>;

export function HSCodesTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { data: hsCodes, isLoading } = useHSCodes();
  const createHSCode = useCreateHSCode();

  const form = useForm<HSCodeFormData>({
    resolver: zodResolver(hsCodeSchema),
    defaultValues: {
      duty_rate: 0,
      sales_tax_rate: 17,
      is_restricted: false,
      requires_license: false,
    },
  });

  const filteredCodes = hsCodes?.filter(hs =>
    hs.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hs.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hs.chapter.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onSubmit = async (data: HSCodeFormData) => {
    try {
      await createHSCode.mutateAsync(data as any);
      setIsAddDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Failed to create HS Code:", error);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          HS Codes & Duty Rates
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search HS codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add HS Code
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add HS Code</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>HS Code</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 8471.30" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="chapter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chapter</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 84" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Goods description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="duty_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customs Duty Rate (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sales_tax_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sales Tax Rate (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="additional_duty_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Duty (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="regulatory_duty_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Regulatory Duty (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-6">
                    <FormField
                      control={form.control}
                      name="is_restricted"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="!mt-0">Restricted Item</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="requires_license"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="!mt-0">Requires License</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional notes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createHSCode.isPending}>
                      {createHSCode.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Add HS Code
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>HS Code</TableHead>
                <TableHead>Chapter</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Customs Duty</TableHead>
                <TableHead className="text-right">Sales Tax</TableHead>
                <TableHead className="text-right">Additional</TableHead>
                <TableHead className="text-right">Regulatory</TableHead>
                <TableHead>Flags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCodes?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No HS codes found. Add your first HS code to enable duty calculations.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCodes?.map((hs) => (
                  <TableRow key={hs.id}>
                    <TableCell className="font-mono font-medium">{hs.code}</TableCell>
                    <TableCell>{hs.chapter}</TableCell>
                    <TableCell className="max-w-xs truncate">{hs.description}</TableCell>
                    <TableCell className="text-right">{hs.duty_rate}%</TableCell>
                    <TableCell className="text-right">{hs.sales_tax_rate}%</TableCell>
                    <TableCell className="text-right">{hs.additional_duty_rate || 0}%</TableCell>
                    <TableCell className="text-right">{hs.regulatory_duty_rate || 0}%</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {hs.is_restricted && (
                          <Badge variant="destructive" className="text-xs">Restricted</Badge>
                        )}
                        {hs.requires_license && (
                          <Badge variant="outline" className="text-xs">License</Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
