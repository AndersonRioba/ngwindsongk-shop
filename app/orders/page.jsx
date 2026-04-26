'use client';

import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { postData, fetcher, getData } from '@/app/lib/data';
import useAuth from '@/src/hooks/useAuth';
import { getImageUrl } from "@/app/lib/utils/image";

const statusDots = {
    pending: 'bg-amber-500',
    processing: 'bg-primary',
    in_transit: 'bg-nanacare',
    delivered: 'bg-emerald-500',
    cancelled: 'bg-black/30',
    paid: 'bg-emerald-500',
    failed: 'bg-red-400',
};

function formatCurrency(value) {
    return `KES ${Number(value || 0).toLocaleString()}`;
}

function formatDate(value) {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function StatusBadge({ label, tone }) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#f7f7f5] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-black/60">
            <span className={`h-2 w-2 rounded-full ${statusDots[tone] || 'bg-black/25'}`} />
            {label}
        </span>
    );
}

function OrderCard({ order }) {
    const [paymentPhone, setPaymentPhone] = useState(order.order_detail?.phone || '');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const itemsCount = order.sales?.reduce((sum, sale) => sum + Number(sale.quantity || 0), 0) || 0;
    const canInitiatePayment = (order.payment_status || 'pending') === 'pending';

    const handleInitiatePayment = () => {
        if (!paymentPhone.trim()) {
            setPaymentError('Enter the phone number that should receive the M-Pesa prompt.');
            return;
        }

        setIsProcessingPayment(true);
        setPaymentError('');

        postData((response) => {
            setIsProcessingPayment(false);

            if (!response || response.success === false || response.ResponseCode !== '0') {
                setPaymentError(response?.message || 'Unable to initiate payment right now.');
            }
        }, {
            amount: Number(order.total || 0),
            phone: paymentPhone.trim(),
            order_id: order.slug,
        }, '/pay/mpesa');
    };

    return (
        <article className="ui-enter ui-card-lift rounded-[2rem] border border-black/5 bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.05)] md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-black/45">Order</p>
                    <h2 className="mt-1 text-lg font-semibold text-black">#{order.id}</h2>
                    <p className="text-sm text-black/55">{order.slug || 'No code available'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <StatusBadge
                        tone={order.status || 'pending'}
                        label={(order.status || 'pending').replace('_', ' ')}
                    />
                    <StatusBadge
                        tone={order.payment_status || 'pending'}
                        label={(order.payment_status || 'pending').replace('_', ' ')}
                    />
                </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-[#f7f7f5] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-black/40">Placed</p>
                    <p className="mt-2 font-medium text-black">{formatDate(order.created_at)}</p>
                </div>
                <div className="rounded-2xl bg-[#f7f7f5] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-black/40">Total</p>
                    <p className="mt-2 font-medium text-black">{formatCurrency(order.total)}</p>
                </div>
                <div className="rounded-2xl bg-[#f7f7f5] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-black/40">Items</p>
                    <p className="mt-2 font-medium text-black">{itemsCount}</p>
                </div>
            </div>

            <div className="mt-5 grid gap-4 rounded-[1.5rem] bg-[#fcfcfb] p-4 text-sm text-black/70 md:grid-cols-2">
                <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-black/40">Contact</p>
                    <p className="mt-2 font-medium text-black">{order.order_detail?.full_name || 'N/A'}</p>
                    <p className="mt-1">{order.order_detail?.phone || 'N/A'}</p>
                </div>
                <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-black/40">Delivery</p>
                    <p className="mt-2 font-medium text-black">{order.order_detail?.address || 'Pickup / no address provided'}</p>
                    <p className="mt-1">{order.payment_method || 'Payment method not set'}</p>
                </div>
            </div>

            <div className="mt-6">
                <p className="text-xs uppercase tracking-[0.14em] text-black/40">Products</p>
                {order.sales?.length ? (
                    <div className="mt-3 space-y-3">
                        {order.sales.map((sale) => (
                            <div key={sale.id} className="rounded-[1.25rem] border border-black/5 bg-[#fcfcfb] p-4 text-sm transition-colors duration-200 hover:border-black/10">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="font-medium text-black">{sale.product?.name || `Product #${sale.product_id}`}</p>
                                        {sale.product_variation?.value && (
                                            <p className="mt-1 text-black/55">{sale.product_variation.value}</p>
                                        )}
                                        <p className="mt-1 text-black/55">Qty: {sale.quantity}</p>
                                    </div>
                                    <p className="font-medium text-black">{formatCurrency(sale.total || (sale.price * sale.quantity))}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="mt-3 text-sm text-black/55">No product lines available for this order.</p>
                )}
            </div>

            {canInitiatePayment && (
                <div className="mt-6 rounded-[1.75rem] border border-black/5 bg-[#f7f7f5] p-4">
                    <div className="flex items-center gap-3">
                        <Image 
                            src={getImageUrl("/mpesa.svg")} 
                            alt="M-Pesa" 
                            width={80}
                            height={40}
                            className="h-10 w-auto object-contain" 
                        />
                        <div>
                            <p className="font-semibold text-black">Initiate Payment</p>
                            <p className="text-sm text-black/60">Send an M-Pesa prompt for {formatCurrency(order.total)}.</p>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 md:flex-row">
                        <input
                            type="tel"
                            value={paymentPhone}
                            onChange={(e) => setPaymentPhone(e.target.value)}
                            placeholder="0712345678"
                            className="ui-field w-full rounded-xl border border-black/10 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <button
                            type="button"
                            disabled={isProcessingPayment}
                            onClick={handleInitiatePayment}
                            className="ui-pressable rounded-xl bg-primary px-5 py-3 font-semibold text-white shadow-sm disabled:opacity-60"
                        >
                            {isProcessingPayment ? 'Processing...' : 'Pay'}
                        </button>
                    </div>

                    {paymentError && <p className="mt-3 text-sm font-medium text-red-600">{paymentError}</p>}
                </div>
            )}
        </article>
    );
}

function OrdersPageContent() {
    const searchParams = useSearchParams();
    const orderParam = searchParams.get('order');

    const { user, token, isLoading: authLoading } = useAuth();
    const [lookupCode, setLookupCode] = useState(orderParam || '');
    const [guestOrder, setGuestOrder] = useState(null);
    const [guestLoading, setGuestLoading] = useState(false);
    const [guestError, setGuestError] = useState('');

    const queryParams = { user_id: user?.id };
    if (orderParam) {
        queryParams.order = orderParam;
    }

    const { data: ordersData, error: ordersError, isLoading: ordersSWRIsLoading } = useSWR(
        user?.id ? ['/orders', queryParams, process.env.NEXT_PUBLIC_API_URL, token] : null,
        fetcher
    );

    const orders = Array.isArray(ordersData) ? ordersData : (ordersData?.data || []);
    const ordersLoading = ordersSWRIsLoading;

    const performLookup = (code) => {
        if (!code) {
            setGuestError('Enter your order code to continue.');
            setGuestOrder(null);
            return;
        }

        setGuestLoading(true);
        setGuestError('');
        setGuestOrder(null);

        getData(
            (data) => {
                setGuestOrder(data);
                setGuestLoading(false);
            },
            `/orders/${encodeURIComponent(code)}`,
            {}
        );
    };

    const handleLookupOrder = async (e) => {
        if (e) e.preventDefault();
        performLookup(lookupCode.trim());
    };

    useEffect(() => {
        if (!authLoading && !user && orderParam && !guestOrder && !guestLoading && !guestError) {
            performLookup(orderParam);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, user, orderParam]);

    let content;

    if (authLoading) {
        content = <div className="ui-enter rounded-[2rem] border border-black/5 bg-white p-6 text-sm text-black/60 shadow-[0_24px_80px_rgba(0,0,0,0.05)]">Checking your account...</div>;
    } else if (user) {
        if (ordersLoading) {
            content = <div className="ui-enter rounded-[2rem] border border-black/5 bg-white p-6 text-sm text-black/60 shadow-[0_24px_80px_rgba(0,0,0,0.05)]">Loading your orders...</div>;
        } else if (ordersError) {
            content = <div className="ui-enter rounded-[2rem] border border-red-200/70 bg-red-50/80 p-6 text-sm text-red-700 shadow-[0_24px_80px_rgba(0,0,0,0.04)]">{ordersError?.message || ordersError || 'We could not load your orders.'}</div>;
        } else if (orders.length === 0) {
            content = <div className="ui-enter rounded-[2rem] border border-black/5 bg-white p-6 text-sm text-black/60 shadow-[0_24px_80px_rgba(0,0,0,0.05)]">You have not placed any orders yet.</div>;
        } else {
            content = (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            );
        }
    } else {
        content = (
            <div className="space-y-6">
                <form onSubmit={handleLookupOrder} className="ui-enter ui-card-lift rounded-[2rem] border border-black/5 bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.05)]">
                    <h2 className="text-xl font-semibold text-black">Track your order</h2>
                    <p className="mt-2 text-sm text-black/60">Enter the order code or slug you received after checkout.</p>
                    <div className="mt-5 flex flex-col gap-3 md:flex-row">
                        <input
                            type="text"
                            value={lookupCode}
                            onChange={(e) => setLookupCode(e.target.value)}
                            placeholder="e.g. ord_123abc"
                            className="ui-field w-full rounded-xl border border-black/10 bg-[#fcfcfb] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <button
                            type="submit"
                            disabled={guestLoading}
                            className="ui-pressable rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-sm disabled:opacity-60"
                        >
                            {guestLoading ? 'Searching...' : 'Find order'}
                        </button>
                    </div>
                    {guestError && <p className="mt-3 text-sm font-medium text-red-600">{guestError}</p>}
                </form>

                {guestOrder && <OrderCard order={guestOrder} />}
            </div>
        );
    }

    return (
        <main className="relative mx-auto min-h-[60vh] max-w-5xl px-4 py-8 md:px-6 md:py-12">
            <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top_left,_rgba(24,119,242,0.08),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(249,115,22,0.08),_transparent_34%),linear-gradient(to_bottom,_rgba(255,255,255,0.98),_rgba(252,252,251,1))]" />
            <div className="ui-enter mb-8">
                <p className="text-xs uppercase tracking-[0.32em] text-black/45">Orders</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black md:text-4xl">Your order history</h1>
                <p className="mt-2 max-w-2xl text-sm text-black/60">
                    {user
                        ? 'Review your recent purchases, payment state, and delivery details.'
                        : 'Sign in to see all your orders, or enter an order code below to check a specific purchase.'}
                </p>
            </div>

            {content}
        </main>
    );
}

export default function OrdersPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-sm text-black/60">Loading orders...</div>}>
            <OrdersPageContent />
        </Suspense>
    );
}
