import { FaClock } from "react-icons/fa";
import homeIcon from "../assets/home.svg";
import homeActiveIcon from "../assets/home_active.svg";
import logo from "../assets/logo.png";
import orderIcon from "../assets/order.svg";
import orderActiveIcon from "../assets/order_active.svg";
import productIcon from "../assets/product.svg";
import productActiveIcon from "../assets/product_active.svg";
import reviewsIcon from "../assets/reviews.svg";
import reviewsActiveIcon from "../assets/reviews_active.svg";
import usersIcon from "../assets/users.svg";
import usersActiveIcon from "../assets/users_active.svg";
import { useAuth } from "../AuthContext";
import SidebarItem from "./SidebarItem";

const Sidebar = () => {
  const { currentUser } = useAuth();

  const canView = (allowedRoles?: string[]) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    if (!currentUser?.role) return false;
    return allowedRoles.includes(currentUser.role);
  };

  const navSections = [
    {
      title: "Main menu",
      items: [
        { to: "/", icon: homeIcon, activeIcon: homeActiveIcon, label: "Dashboard" },
        {
          to: "/orders",
          icon: orderIcon,
          activeIcon: orderActiveIcon,
          label: "Quản lý đơn hàng",
          roles: ["super_admin", "manager", "staff"],
        },
        {
          to: "/customers",
          icon: usersIcon,
          activeIcon: usersActiveIcon,
          label: "Quản lý khách hàng",
          roles: ["super_admin", "manager"],
        },
        {
          to: "/feedback",
          icon: reviewsIcon,
          activeIcon: reviewsActiveIcon,
          label: "Quản lí phản hồi",
          roles: ["super_admin", "manager", "staff"],
        },
        {
          to: "/history",
          icon: FaClock,
          label: "Quản lí truy cập",
          roles: ["super_admin"],
        },
      ],
    },
    {
      title: "Product",
      items: [
        {
          to: "/products",
          icon: productIcon,
          activeIcon: productActiveIcon,
          label: "Quản lý sản phẩm",
          roles: ["super_admin", "manager", "staff"],
        },
        {
          to: "/employees",
          icon: usersIcon,
          activeIcon: usersActiveIcon,
          label: "Quản lý nhân viên",
          roles: ["super_admin"],
        },
      ],
    },
  ];

  return (
    <aside className="h-full flex flex-col bg-white">
      <div className="h-20 px-6 border-b border-gray-200 flex items-center gap-3">
        {/* <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center"> */}
        <img src={logo} alt="Organic logo" className="w-12 h-12 object-contain" />
        {/* </div> */}
        <div>
          <p className="text-lg font-semibold text-gray-900">Organic</p>
          <p className="text-xs uppercase text-gray-400 tracking-widest">Main menu</p>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-4 py-6 space-y-8">
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => canView(item.roles));
          if (!visibleItems.length) return null;
          return (
            <div key={section.title}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-2">
                {section.title}
              </p>
              <ul className="space-y-1">
                {visibleItems.map((item) => (
                  <li key={item.to}>
                    <SidebarItem
                      to={item.to}
                      icon={item.icon}
                      activeIcon={item.activeIcon}
                      label={item.label}
                    />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
