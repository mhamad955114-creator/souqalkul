import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Package, Clock, CheckCircle } from "lucide-react";

const MyOrders = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Placeholder orders data - will be replaced with real data when payment system is implemented
  const orders: Array<{
    id: string;
    type: string;
    listingTitle: string;
    amount: number;
    status: "pending" | "completed" | "cancelled";
    date: string;
  }> = [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Package className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "قيد المعالجة";
      case "completed":
        return "مكتمل";
      case "cancelled":
        return "ملغي";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">طلباتي</h1>
              <p className="text-muted-foreground">
                عرض جميع طلبات الترقية والإعلانات المدفوعة
              </p>
            </div>
          </div>

          {orders.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  لا توجد طلبات حتى الآن
                </h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  عند شراء باقات الإعلانات المميزة أو الاحترافية، ستظهر طلباتك هنا
                </p>
                <Button onClick={() => navigate("/pricing")}>
                  استعرض باقات الإعلانات
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(order.status)}
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {order.type}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {order.listingTitle}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-primary">
                          {order.amount.toLocaleString()} ل.س
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getStatusText(order.status)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default MyOrders;
