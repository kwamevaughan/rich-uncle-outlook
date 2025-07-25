import MainLayout from "@/layouts/MainLayout";
import { useUser } from "../hooks/useUser";
import useLogout from "../hooks/useLogout";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DashboardStatsGridContainer from "@/components/DashboardStatsGridContainer";
import DateRangePicker from "@/components/DateRangePicker";
import ProfitLossChart from "@/components/ProfitLossChart";
import OverallInfoCard from "@/components/OverallInfoCard";
import CustomersOverviewCard from "@/components/CustomersOverviewCard";
import TopSellingProductsCard from "@/components/TopSellingProductsCard";
import LowStockProductsCard from "@/components/LowStockProductsCard";
import RecentSalesCard from "@/components/RecentSalesCard";
import SalesStaticsCard from "@/components/SalesStaticsCard";
import RecentTransactionsCard from "@/components/RecentTransactionsCard";
import TopCustomersCard from "@/components/TopCustomersCard";
import TopCategoriesCard from "@/components/TopCategoriesCard";
import OrderStatisticsHeatmap from "@/components/OrderStatisticsHeatmap";
import toast from 'react-hot-toast';

export default function Dashboard({ mode = "light", toggleMode, ...props }) {
  const { user, loading: userLoading, LoadingComponent } = useUser();
  const { handleLogout } = useLogout();
  const router = useRouter();

  // Date range state
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return { startDate: startOfDay, endDate: startOfDay, label: "Today" };
  });

  const [orderCount, setOrderCount] = useState(null);
  const [orderError, setOrderError] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [lowStockProduct, setLowStockProduct] = useState(null);
  const [stockError, setStockError] = useState(null);
  const [stockLoading, setStockLoading] = useState(true);
  const [showLowStock, setShowLowStock] = useState(true);
  const [selectedStore, setSelectedStore] = useState("");
  const [stores, setStores] = useState([]);

  // Fetch stores on mount
  useEffect(() => {
    fetch('/api/stores')
      .then(res => res.json())
      .then(({ data }) => setStores(data || []));
  }, []);

  // Listen for store selection changes
  useEffect(() => {
    const updateStore = () => {
      const storeId = localStorage.getItem('selected_store_id') || "";
      setSelectedStore(storeId);
      if (storeId) {
        const store = stores.find(s => s.id === storeId);
        if (store) {
          toast.success(`Now viewing dashboard for: ${store.name}`);
        }
      } else {
        toast.success('Now viewing dashboard for: All Stores');
      }
    };
    updateStore();
    window.addEventListener('storage', updateStore);
    const interval = setInterval(() => {
      const storeId = localStorage.getItem('selected_store_id') || "";
      setSelectedStore(prev => {
        if (prev !== storeId) {
          if (storeId) {
            const store = stores.find(s => s.id === storeId);
            if (store) {
              toast.success(`Now viewing dashboard for: ${store.name}`);
            }
          } else {
            toast.success('Now viewing dashboard for: All Stores');
          }
          return storeId;
        }
        return prev;
      });
    }, 300);
    return () => {
      window.removeEventListener('storage', updateStore);
      clearInterval(interval);
    };
  }, [stores]);

  useEffect(() => {
    const fetchOrders = async () => {
      setOrdersLoading(true);
      setOrderError(null);
      try {
        const res = await fetch("/api/orders");
        const result = await res.json();
        if (!result.success)
          throw new Error(result.error || "Failed to fetch orders");
        let { startDate, endDate } = dateRange;
        // Normalize startDate to start of day, endDate to end of day
        startDate = new Date(startDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(endDate);
        endDate.setHours(23, 59, 59, 999);
        const start = startDate;
        const end = endDate;
        const filteredOrders = (result.data || []).filter((order) => {
          if (!order.timestamp) return false;
          let ts = new Date(order.timestamp.replace(' ', 'T'));
          if (isNaN(ts)) ts = new Date(Date.parse(order.timestamp.replace(' ', 'T')));
          // Filter by selected store
          if (selectedStore && String(order.store_id) !== String(selectedStore)) return false;
          return ts >= start && ts <= end;
        });
        setOrderCount(filteredOrders.length);
      } catch (err) {
        setOrderError(err.message || "Failed to fetch orders");
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [dateRange]);

  useEffect(() => {
    const fetchLowStock = async () => {
      setStockLoading(true);
      setStockError(null);
      try {
        const res = await fetch("/api/products");
        const result = await res.json();
        if (!result.success)
          throw new Error(result.error || "Failed to fetch products");
        const lowStock = (result.data || []).filter(
          (p) => parseInt(p.quantity) > 0 && parseInt(p.quantity) <= 5
        );
        setLowStockProduct(lowStock.length > 0 ? lowStock[0] : null);
      } catch (err) {
        setStockError(err.message || "Failed to fetch products");
      } finally {
        setStockLoading(false);
      }
    };
    fetchLowStock();
  }, []);

  if (userLoading && LoadingComponent) return LoadingComponent;
  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    return null;
  }

  return (
    <MainLayout
      mode={mode}
      user={user}
      toggleMode={toggleMode}
      onLogout={handleLogout}
      {...props}
    >
      <div className="flex flex-col justify-center p-">
        {/* Header Row: Welcome Text on Left, Hello on Right */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome, {user.name}</h1>
            <p className="flex items-center text-sm text-gray-500">
              {ordersLoading ? (
                <span>Loading orders...</span>
              ) : orderError ? (
                <span className="text-red-600">{orderError}</span>
              ) : (
                <>
                  You have{" "}
                  <span className="font-bold text-blue-800 mx-1">
                    {orderCount}
                    {orderCount > 0 ? "+" : ""}
                  </span>{" "}
                  Orders, {dateRange.label}.{" "}
                  <span className="text-xs text-gray-400 ml-1">
                    {selectedStore
                      ? `Filtered for: ${
                          stores.find((s) => s.id === selectedStore)?.name
                        }`
                      : "All Stores"}
                  </span>
                </>
              )}
            </p>
          </div>

          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        {/* Low Stock Notification Box */}
        {showLowStock && (
          <div className="flex items-center justify-between mt-4 bg-orange-100 p-2 rounded-md">
            <p className="text-sm text-gray-500 flex gap-2">
              {stockLoading ? (
                <span>Loading stock info...</span>
              ) : stockError ? (
                <span className="text-red-600">{stockError}</span>
              ) : lowStockProduct ? (
                <>
                  Your Product{" "}
                  <span className="font-bold text-blue-900">
                    {lowStockProduct.name}
                  </span>{" "}
                  is running Low, already below {lowStockProduct.quantity} Pcs.
                  <button
                    className="text-blue-900 font-bold underline"
                    onClick={() =>
                      router.push(
                        `/manage-stock?quickUpdateId=${lowStockProduct.id}`
                      )
                    }
                  >
                    Add Stock
                  </button>
                </>
              ) : (
                <span>All products are sufficiently stocked.</span>
              )}
            </p>
            <button
              className="flex items-center justify-end cursor-pointer"
              onClick={() => setShowLowStock(false)}
              aria-label="Close notification"
            >
              <Icon
                icon="iconamoon:close"
                className="text-2xl text-gray-500 hover:text-gray-700"
              />
            </button>
          </div>
        )}
      </div>

      <DashboardStatsGridContainer
        dateRange={dateRange}
        selectedStore={selectedStore}
      />

      <div className="flex gap-4 mt-4 mb-4">
        <div className="w-2/3 bg-white rounded-lg shadow-md">
          <ProfitLossChart selectedStore={selectedStore} />
        </div>
        <div className="w-1/3 flex flex-col gap-4 bg-white rounded-lg shadow-md h-full">
          <div className="border-b-2 border-gray-100 pb-4">
            <OverallInfoCard />
          </div>
          <CustomersOverviewCard selectedStore={selectedStore} />
        </div>
      </div>
      <div className="flex gap-4 mt-4">
        <div className="flex-1 bg-white rounded-lg shadow-md p-4">
          <TopSellingProductsCard selectedStore={selectedStore} />
        </div>

        <div className="flex-1 bg-white rounded-lg shadow-md p-4">
          <LowStockProductsCard selectedStore={selectedStore} />
        </div>

        <div className="flex-1 bg-white rounded-lg shadow-md p-4">
          <RecentSalesCard selectedStore={selectedStore} />
        </div>
      </div>

      <div className="flex gap-4 mt-4">
        <div className="flex-1 bg-white rounded-lg shadow-md p-4">
          <SalesStaticsCard selectedStore={selectedStore} />
        </div>

        <div className="flex-1 bg-white rounded-lg shadow-md p-4">
          <RecentTransactionsCard selectedStore={selectedStore} />
        </div>
      </div>
      <div className="flex gap-4 mt-4">
        <div className="flex-1 bg-white rounded-lg shadow-md p-4">
          <TopCustomersCard selectedStore={selectedStore} />
        </div>

        <div className="flex-1 bg-white rounded-lg shadow-md p-4">
          <TopCategoriesCard selectedStore={selectedStore} />
        </div>

        <div className="flex-1 bg-white rounded-lg shadow-md p-4">
          <OrderStatisticsHeatmap selectedStore={selectedStore} />
        </div>
      </div>
    </MainLayout>
  );
}
