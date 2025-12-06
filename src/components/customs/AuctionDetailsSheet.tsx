import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { type Auction, type AuctionStatus, useAuctionBids, useCreateAuctionBid } from "@/hooks/useCustoms";
import { format } from "date-fns";
import { Gavel, Calendar, User, DollarSign, Plus, Loader2 } from "lucide-react";

interface AuctionDetailsSheetProps {
  auction: Auction | null;
  onClose: () => void;
}

const statusConfig: Record<AuctionStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  scheduled: { label: "Scheduled", variant: "secondary" },
  active: { label: "Active", variant: "default" },
  completed: { label: "Completed", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

export function AuctionDetailsSheet({ auction, onClose }: AuctionDetailsSheetProps) {
  const [bidderName, setBidderName] = useState("");
  const [bidderNtn, setBidderNtn] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  
  const { data: bids } = useAuctionBids(auction?.id || "");
  const createBid = useCreateAuctionBid();

  if (!auction) return null;

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "-";
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePlaceBid = async () => {
    if (!bidderName || !bidAmount) return;
    
    await createBid.mutateAsync({
      auction_id: auction.id,
      bidder_name: bidderName,
      bidder_ntn: bidderNtn || undefined,
      bid_amount: parseFloat(bidAmount),
    });
    
    setBidderName("");
    setBidderNtn("");
    setBidAmount("");
  };

  const minBid = (auction.current_bid || auction.starting_bid || auction.reserve_price) + 1000;

  return (
    <Sheet open={!!auction} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              {auction.auction_number}
            </SheetTitle>
            <Badge variant={statusConfig[auction.status].variant}>
              {statusConfig[auction.status].label}
            </Badge>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Auction Info */}
          <div>
            <h4 className="font-semibold mb-3">Auction Details</h4>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium capitalize">{auction.auction_type}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Scheduled</dt>
                <dd className="font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(auction.scheduled_date), "dd MMM yyyy HH:mm")}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Auctioneer</dt>
                <dd className="font-medium">{auction.auctioneer_name || "-"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">License</dt>
                <dd className="font-medium">{auction.auctioneer_license || "-"}</dd>
              </div>
            </dl>
          </div>

          <Separator />

          {/* Pricing */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pricing
            </h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Reserve Price</dt>
                <dd className="font-medium">{formatCurrency(auction.reserve_price)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Starting Bid</dt>
                <dd className="font-medium">{formatCurrency(auction.starting_bid)}</dd>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <dt className="font-semibold">Current Bid</dt>
                <dd className="font-bold text-primary">{formatCurrency(auction.current_bid)}</dd>
              </div>
              {auction.winning_bid && (
                <div className="flex justify-between text-lg">
                  <dt className="font-semibold text-green-600">Winning Bid</dt>
                  <dd className="font-bold text-green-600">{formatCurrency(auction.winning_bid)}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Consignment */}
          {auction.consignments && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3">Consignment</h4>
                <div className="bg-card border rounded-lg p-3 text-sm">
                  <p className="font-mono text-muted-foreground">{auction.consignments.tracking_number}</p>
                  <p className="font-medium mt-1">{auction.consignments.goods_description}</p>
                  <p className="text-muted-foreground mt-1">
                    Value: {formatCurrency(auction.consignments.declared_value)}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Winner */}
          {auction.winner_name && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3">Winner</h4>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Name</dt>
                    <dd className="font-medium">{auction.winner_name}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">NTN</dt>
                    <dd className="font-medium">{auction.winner_ntn || "-"}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Contact</dt>
                    <dd className="font-medium">{auction.winner_contact || "-"}</dd>
                  </div>
                </dl>
              </div>
            </>
          )}

          <Separator />

          {/* Bid History */}
          <div>
            <h4 className="font-semibold mb-3">Bid History</h4>
            {bids?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No bids placed yet</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {bids?.map((bid, index) => (
                  <div 
                    key={bid.id} 
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      index === 0 ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{bid.bidder_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(bid.bid_time), "dd MMM HH:mm:ss")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${index === 0 ? "text-primary" : ""}`}>
                        {formatCurrency(bid.bid_amount)}
                      </p>
                      {bid.is_winning && (
                        <Badge variant="default" className="text-xs">Winner</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Place Bid (only for active auctions) */}
          {auction.status === "active" && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Place Bid
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Bidder Name *"
                      value={bidderName}
                      onChange={(e) => setBidderName(e.target.value)}
                    />
                    <Input
                      placeholder="NTN (Optional)"
                      value={bidderNtn}
                      onChange={(e) => setBidderNtn(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Input
                      type="number"
                      placeholder={`Minimum: ${formatCurrency(minBid)}`}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      min={minBid}
                    />
                    <Button 
                      onClick={handlePlaceBid} 
                      disabled={createBid.isPending || !bidderName || !bidAmount}
                    >
                      {createBid.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Place Bid
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
