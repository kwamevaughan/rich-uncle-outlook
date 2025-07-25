import { useState, useEffect } from "react";
import PrintReceipt from "./PrintReceipt";
import SimpleModal from "./SimpleModal";
import { Icon } from "@iconify/react";

const OrderHistoryModal = ({ isOpen, onClose, customers, statusFilter, onResume = () => {} }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    
    fetch('/api/orders')
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          setOrders(result.data || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch orders:", err);
        setLoading(false);
      });
  }, [isOpen]);

  const handlePrint = async (order) => {
    setPrinting(order.id);
    try {
      // Fetch order items
      const response = await fetch(`/api/order-items?order_id=${order.id}`);
      const result = await response.json();
      
      if (result.success) {
        const items = result.data || [];

        // Prepare data for PrintReceipt
        const printReceipt = PrintReceipt({
          orderId: order.id,
          selectedProducts: items.map((item) => item.product_id),
          quantities: items.reduce((acc, item) => {
            acc[item.product_id] = item.quantity;
            return acc;
          }, {}),
          products: items.map((item) => ({
            id: item.product_id,
            name: item.name,
            price: item.price,
          })),
          subtotal: order.subtotal,
          tax: order.tax,
          discount: order.discount,
          total: order.total,
          selectedCustomerId: order.customer_id,
          customers: customers,
          paymentData: order.payment_data,
        });

        printReceipt.printOrder();
      }
    } catch (error) {
      console.error("Print error:", error);
    } finally {
      setPrinting(null);
    }
  };

  const filteredOrders = orders
    .filter((order) => {
      if (statusFilter && Array.isArray(statusFilter)) {
        if (!statusFilter.includes(order.status)) return false;
      } else if (statusFilter && order.status !== statusFilter) {
        return false;
      }
      const matchesSearch =
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm);

      if (dateFilter === "today") {
        const today = new Date().toDateString();
        return (
          matchesSearch && new Date(order.timestamp).toDateString() === today
        );
      }
      if (dateFilter === "week") {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return matchesSearch && new Date(order.timestamp) >= weekAgo;
      }
      return matchesSearch;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (order) => {
    // You can customize this based on your order status logic
    return "bg-green-100 text-green-800 border-green-200";
  };

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Order History"
      width="max-w-5xl"
    >
      <div className="space-y-6">
        {/* Header with Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Icon
                icon="mdi:magnify"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
              />
              <input
                type="text"
                placeholder="Search orders or customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm placeholder-gray-500 transition-all"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
            </select>

            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
              <Icon icon="mdi:receipt" className="w-4 h-4" />
              <span>{filteredOrders.length} orders</span>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
              <span>Loading orders...</span>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Icon
              icon="mdi:receipt-text-outline"
              className="w-16 h-16 mb-4 text-gray-300"
            />
            <h3 className="text-lg font-medium mb-2">No orders found</h3>
            <p className="text-sm">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Icon
                              icon="mdi:receipt"
                              className="w-5 h-5 text-blue-600"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              #{order.id}
                            </div>
                            <div className="text-sm text-gray-500">
                              Order ID
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer_name || "Walk-in Customer"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(order.timestamp)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          GHS{" "}
                          {Number(order.total).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            order
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end">
                        {(order.status === "Hold" ||
                          order.status === "Layaway") && (
                          <button
                            onClick={() => onResume && onResume(order)}
                            className={`inline-flex items-center gap-2 px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
                              order.status === "Hold"
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-indigo-600 hover:bg-indigo-700"
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all`}
                          >
                            <Icon
                              icon={
                                order.status === "Hold"
                                  ? "mdi:play-circle"
                                  : "mdi:check-circle"
                              }
                              className="w-4 h-4"
                            />
                            <span>
                              {order.status === "Hold"
                                ? "Resume"
                                : "Settle Layaway"}
                            </span>
                          </button>
                        )}
                        <button
                          onClick={() => handlePrint(order)}
                          disabled={printing === order.id}
                          className="inline-flex items-center gap-2 px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {printing === order.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              <span>Printing...</span>
                            </>
                          ) : (
                            <>
                              <Icon icon="mdi:printer" className="w-4 h-4" />
                              <span>Print</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </SimpleModal>
  );
};

export default OrderHistoryModal;
