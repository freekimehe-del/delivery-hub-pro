import { useState } from "react";
import { useAuctions, useCreateAuction, useConsignments, type Auction, type AuctionStatus, type AuctionType } from "@/hooks/useCustoms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Gavel, Calendar, Loader2, Eye } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { AuctionDetailsSheet } from "./AuctionDetailsSheet";

const statusConfig: Record<AuctionStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  scheduled: { label: "Scheduled", variant: "secondary" },
  active: { label: "Active", variant: "default" },
  completed: { label: "Completed", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

const typeConfig: Record<AuctionType, { label: string; color: string }> = {
  public: { label: "Public", color: "text-green-600" },
  private: { label: "Private", color: "text-blue-600" },
};

const auctionSchema = z.object({
  auction_type: z.enum(["public", "private"]),
  consignment_id: z.string().optional(),
  reserve_price: z.coerce.number().min(0, "Reserve price must be positive"),
  starting_bid: z.coerce.number().optional(),
  scheduled_date: z.string().min(1, "Scheduled date is required"),
  auctioneer_name: z.string().optional(),
  auctioneer_license: z.string().optional(),
  notes: z.string().optional(),
});

type AuctionFormData = z.infer<typeof auctionSchema>;

export function AuctionsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const { data: auctions, isLoading } = useAuctions();
  const { data: consignments } = useConsignments();
  const createAuction = useCreateAuction();

  const form = useForm<AuctionFormData>({
    resolver: zodResolver(auctionSchema),
    defaultValues: {
      auction_type: "public",
    },
  });

  const filteredAuctions = auctions?.filter(a =>
    a.auction_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.auctioneer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "-";
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const onSubmit = async (data: AuctionFormData) => {
    try {
      await createAuction.mutateAsync(data as any);
      setIsAddDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Failed to create auction:", error);
    }
  };

  // Filter consignments that can be auctioned (held status)
  const auctionableConsignments = consignments?.filter(c => 
    c.status === "held" || c.status === "bonded"
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            Customs Auctions
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search auctions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Auction
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Auction</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="auction_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Auction Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="public">Public Auction</SelectItem>
                              <SelectItem value="private">Private Auction</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="consignment_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Consignment (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select consignment" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {auctionableConsignments?.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.tracking_number} - {c.goods_description.substring(0, 30)}...
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="reserve_price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reserve Price (PKR)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Minimum price" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="starting_bid"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Starting Bid (PKR)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Opening bid" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="scheduled_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scheduled Date & Time</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="auctioneer_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Auctioneer Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Licensed auctioneer" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="auctioneer_license"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Auctioneer License</FormLabel>
                            <FormControl>
                              <Input placeholder="License number" {...field} />
                            </FormControl>
                            <FormMessage />
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

                    <div className="bg-muted/50 rounded-lg p-3 text-sm">
                      <p className="font-medium mb-1">Note:</p>
                      <p className="text-muted-foreground">
                        Per SRO 450(I)/2001, perishable goods and goods valued over PKR 1 million must be handled by registered auctioneers.
                      </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createAuction.isPending}>
                        {createAuction.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Auction
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
                  <TableHead>Auction #</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Consignment</TableHead>
                  <TableHead className="text-right">Reserve Price</TableHead>
                  <TableHead className="text-right">Current Bid</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Auctioneer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAuctions?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No auctions found. Create an auction to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAuctions?.map((auction) => (
                    <TableRow key={auction.id}>
                      <TableCell className="font-mono font-medium">{auction.auction_number}</TableCell>
                      <TableCell>
                        <span className={typeConfig[auction.auction_type].color}>
                          {typeConfig[auction.auction_type].label}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {auction.consignments?.tracking_number || "-"}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(auction.reserve_price)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(auction.current_bid)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {format(new Date(auction.scheduled_date), "dd MMM yyyy HH:mm")}
                        </div>
                      </TableCell>
                      <TableCell>{auction.auctioneer_name || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[auction.status].variant}>
                          {statusConfig[auction.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedAuction(auction)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AuctionDetailsSheet 
        auction={selectedAuction} 
        onClose={() => setSelectedAuction(null)} 
      />
    </>
  );
}
