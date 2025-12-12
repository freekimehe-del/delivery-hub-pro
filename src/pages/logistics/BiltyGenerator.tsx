import React, { useRef, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, RefreshCw } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { QRCodeSVG } from "qrcode.react";

export default function BiltyGenerator() {
    // Form State
    const [data, setData] = useState({
        biltyNo: "2801",
        date: new Date().toISOString().split('T')[0],
        senderName: "Karachi Fabrics",
        senderAddress: "Makkah Market, Karachi",
        senderPhone: "0300-1234567",
        recipientName: "Lahore Textiles",
        recipientAddress: "Akbari Mandi, Lahore",
        recipientPhone: "0300-7654321",
        description: "Cotton Bales",
        quantity: "2 Boxes",
        weight: "120 KG",
        freight: 4000,
        labor: 200,
        addaCharge: 100,
        loading: 100,
        total: 4400,
        advance: 4400,
        balance: 0,
        vehicleNo: "LES-1234",
        driverName: "Ahmed Ali"
    });

    const componentRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData(prev => {
            const updated = { ...prev, [name]: value };
            // Auto calc totals if money fields change
            if (['freight', 'labor', 'addaCharge', 'loading', 'advance'].includes(name)) {
                const f = parseFloat(name === 'freight' ? value : String(prev.freight)) || 0;
                const l = parseFloat(name === 'labor' ? value : String(prev.labor)) || 0;
                const a = parseFloat(name === 'addaCharge' ? value : String(prev.addaCharge)) || 0;
                const lo = parseFloat(name === 'loading' ? value : String(prev.loading)) || 0;
                const adv = parseFloat(name === 'advance' ? value : String(prev.advance)) || 0;
                updated.total = f + l + a + lo;
                updated.balance = updated.total - adv;
            }
            return updated;
        });
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center no-print">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-blue-900">Bilty Generator</h1>
                        <p className="text-muted-foreground">Generate Urdu Goods Transport Receipts.</p>
                    </div>
                    <Button onClick={handlePrint} className="bg-blue-800"><Printer className="w-4 h-4 mr-2" /> Print Bilty</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Input Form */}
                    <Card className="md:col-span-4 no-print h-fit">
                        <CardContent className="pt-6 space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2">Details Input</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1"><Label>Bilty No</Label><Input name="biltyNo" value={data.biltyNo} onChange={handleChange} /></div>
                                <div className="space-y-1"><Label>Date</Label><Input type="date" name="date" value={data.date} onChange={handleChange} /></div>
                            </div>
                            <div className="space-y-1"><Label>Sender Name</Label><Input name="senderName" value={data.senderName} onChange={handleChange} /></div>
                            <div className="space-y-1"><Label>Sender Address</Label><Input name="senderAddress" value={data.senderAddress} onChange={handleChange} /></div>
                            <div className="space-y-1"><Label>Sender Phone</Label><Input name="senderPhone" value={data.senderPhone} onChange={handleChange} /></div>
                            <hr />
                            <div className="space-y-1"><Label>Recipient Name</Label><Input name="recipientName" value={data.recipientName} onChange={handleChange} /></div>
                            <div className="space-y-1"><Label>Recipient Address</Label><Input name="recipientAddress" value={data.recipientAddress} onChange={handleChange} /></div>
                            <div className="space-y-1"><Label>Recipient Phone</Label><Input name="recipientPhone" value={data.recipientPhone} onChange={handleChange} /></div>
                            <hr />
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1"><Label>Description</Label><Input name="description" value={data.description} onChange={handleChange} /></div>
                                <div className="space-y-1"><Label>Quantity/Weight</Label><Input name="quantity" value={data.quantity} onChange={handleChange} /></div>
                            </div>
                            <hr />
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1"><Label>Freight (Rs)</Label><Input type="number" name="freight" value={data.freight} onChange={handleChange} /></div>
                                <div className="space-y-1"><Label>Labor</Label><Input type="number" name="labor" value={data.labor} onChange={handleChange} /></div>
                                <div className="space-y-1"><Label>Adda/Booking</Label><Input type="number" name="addaCharge" value={data.addaCharge} onChange={handleChange} /></div>
                                <div className="space-y-1"><Label>Loading</Label><Input type="number" name="loading" value={data.loading} onChange={handleChange} /></div>
                            </div>
                            <div className="bg-slate-100 p-2 rounded">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1"><Label>Total</Label><Input readOnly value={data.total} className="bg-white font-bold" /></div>
                                    <div className="space-y-1"><Label>Advance</Label><Input type="number" name="advance" value={data.advance} onChange={handleChange} className="border-green-500" /></div>
                                </div>
                                <div className="mt-2 text-right text-sm font-bold text-red-600">Balance: {data.balance}</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preview Area (Urdu Receipt) */}
                    <div className="md:col-span-8 bg-gray-50 p-4 border rounded-xl overflow-auto flex justify-center">
                        <style>{`
                            @media print {
                                .no-print { display: none !important; }
                                .print-area { display: block !important; width: 100%; }
                                body { background: white; -webkit-print-color-adjust: exact; }
                            }
                        `}</style>
                        <div ref={componentRef} className="print-area bg-white w-[95mm] min-h-[140mm] border border-black p-2 text-black text-right relative" style={{ fontFamily: 'Arial, sans-serif' }}>
                            {/* Header */}
                            <div className="bg-slate-800 text-white p-2 text-center rounded-t-sm mb-2">
                                <h1 className="text-xl font-bold mb-1">گڈز ٹرانسپورٹ کمپنی (رجسٹرڈ)</h1>
                                <p className="text-xs">اکبری مارکیٹ، گنج منڈی، راولپنڈی</p>
                                <div className="flex justify-between text-[10px] mt-1 px-1">
                                    <span>گوجرانوالہ: 055-1234567</span>
                                    <span>راولپنڈی: 051-1234567</span>
                                </div>
                            </div>

                            {/* Top Section: QR & Meta */}
                            <div className="flex gap-2 mb-2">
                                <div className="w-20 pt-1">
                                    <QRCodeSVG value={`BILTY-${data.biltyNo}-${data.total}`} size={70} />
                                </div>
                                <div className="flex-1 border border-black">
                                    <div className="grid grid-cols-4 border-b border-black">
                                        <div className="col-span-3 p-1 font-bold text-left">{data.biltyNo}</div>
                                        <div className="col-span-1 bg-slate-200 p-1 text-center font-bold text-xs border-l border-black">بل نمبر</div>
                                    </div>
                                    <div className="grid grid-cols-4 border-b border-black">
                                        <div className="col-span-3 p-1 text-left">{data.biltyNo}</div>
                                        <div className="col-span-1 bg-slate-200 p-1 text-center text-xs border-l border-black">بلٹی نمبر</div>
                                    </div>
                                    <div className="grid grid-cols-4">
                                        <div className="col-span-3 p-1 text-left">{data.date}</div>
                                        <div className="col-span-1 bg-slate-200 p-1 text-center text-xs border-l border-black">تاریخ</div>
                                    </div>
                                </div>
                            </div>

                            {/* Sender/Receiver */}
                            <div className="border border-black mb-2">
                                <div className="grid grid-cols-4 border-b border-black">
                                    <div className="col-span-3 p-1 text-left">{data.senderName}</div>
                                    <div className="col-span-1 bg-slate-200 p-1 text-center text-xs border-l border-black">بھیجنے والا</div>
                                </div>
                                <div className="grid grid-cols-4 border-b border-black">
                                    <div className="col-span-3 p-1 text-left">{data.recipientName}</div>
                                    <div className="col-span-1 bg-slate-200 p-1 text-center text-xs border-l border-black">وصول کنندہ</div>
                                </div>
                                <div className="grid grid-cols-4 border-b border-black">
                                    <div className="col-span-3 p-1 text-left">{data.recipientAddress}</div>
                                    <div className="col-span-1 bg-slate-200 p-1 text-center text-xs border-l border-black">پتہ</div>
                                </div>
                                <div className="grid grid-cols-4">
                                    <div className="col-span-3 p-1 text-left">{data.recipientPhone}</div>
                                    <div className="col-span-1 bg-slate-200 p-1 text-center text-xs border-l border-black">فون نمبر</div>
                                </div>
                            </div>

                            {/* Item Details */}
                            <div className="border border-black mb-2">
                                <div className="grid grid-cols-4 border-b border-black">
                                    <div className="col-span-3 p-1 text-left">{data.description}</div>
                                    <div className="col-span-1 bg-slate-200 p-1 text-center text-xs border-l border-black">تفصیل</div>
                                </div>
                                <div className="grid grid-cols-4">
                                    <div className="col-span-3 p-1 text-left h-8">{data.quantity}</div>
                                    <div className="col-span-1 bg-slate-200 p-1 text-center text-xs border-l border-black">تعداد</div>
                                </div>
                            </div>

                            {/* Charges */}
                            <div className="border border-black mb-2 text-sm">
                                {/* Row 1 */}
                                <div className="grid grid-cols-2 border-b border-black">
                                    <div className="grid grid-cols-2 border-r border-black">
                                        <div className="p-1 text-left font-mono">Rs.{data.addaCharge}</div>
                                        <div className="bg-slate-200 p-1 text-center text-xs border-l border-black">اڈا چارجز</div>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <div className="p-1 text-left font-mono">Rs.{data.freight}</div>
                                        <div className="bg-slate-200 p-1 text-center text-xs border-l border-black">کرایہ</div>
                                    </div>
                                </div>
                                {/* Row 2 */}
                                <div className="grid grid-cols-2 border-b border-black">
                                    <div className="grid grid-cols-2 border-r border-black">
                                        <div className="p-1 text-left font-mono">Rs.{data.loading}</div>
                                        <div className="bg-slate-200 p-1 text-center text-xs border-l border-black">انلوڈنگ</div>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <div className="p-1 text-left font-mono">Rs.{data.labor}</div>
                                        <div className="bg-slate-200 p-1 text-center text-xs border-l border-black">مزدوری</div>
                                    </div>
                                </div>
                                {/* Total */}
                                <div className="grid grid-cols-4 border-b border-black">
                                    <div className="col-span-3 p-1 text-left font-bold font-mono">Rs.{data.total}</div>
                                    <div className="col-span-1 bg-slate-600 text-white p-1 text-center text-xs border-l border-black">کل چارجز</div>
                                </div>
                                {/* Paid */}
                                <div className="grid grid-cols-4 border-b border-black">
                                    <div className="col-span-3 p-1 text-left font-mono">Rs.{data.advance}</div>
                                    <div className="col-span-1 bg-slate-200 p-1 text-center text-xs border-l border-black">ادا کردہ</div>
                                </div>
                                {/* Balance */}
                                <div className="grid grid-cols-4">
                                    <div className="col-span-3 p-1 text-left font-bold font-mono">Rs.{data.balance}</div>
                                    <div className="col-span-1 bg-slate-200 p-1 text-center text-xs border-l border-black">بقایا جات</div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-slate-800 text-white flex justify-between items-center px-2 py-1 text-xs">
                                <div className="flex gap-2 items-center">
                                    <input type="checkbox" checked readOnly className="accent-white" />
                                    <span>وصولی سامان</span>
                                </div>
                                <div className="bg-white text-black px-2 py-0.5 text-[10px] items-center flex">
                                    {data.date}
                                </div>
                                <div className="flex gap-2 items-center">
                                    <span>ادائیگی رقم</span>
                                    <input type="checkbox" checked={data.balance === 0} readOnly className="accent-white" />
                                </div>
                            </div>
                            <div className="text-center text-[10px] mt-1 border-t pt-1">
                                Customer Copy | Bilty Management System
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
