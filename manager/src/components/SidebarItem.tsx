import { NavLink, useLocation } from "react-router-dom";

type IconSource = string | React.ElementType;

interface SidebarItemProps {
  to: string;
  icon: IconSource;
  activeIcon?: IconSource;
  label: string;
}

const SidebarItem = ({ to, icon, activeIcon, label }: SidebarItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const getIconNode = () => {
    if (typeof icon === "string") {
      const deriveActiveIcon = () => {
        if (typeof activeIcon === "string") return activeIcon;
        if (icon.endsWith(".svg")) {
          return icon.replace(".svg", "_active.svg");
        }
        return icon;
      };

      const iconSrc = isActive ? deriveActiveIcon() : icon;
      return (
        <img
          src={iconSrc}
          alt={`${label} icon`}
          className="w-5 h-5 object-contain"
        />
      );
    }

    const IconComponent = (
      isActive && activeIcon && typeof activeIcon !== "string" ? activeIcon : icon
    ) as React.ElementType;

    return (
      <IconComponent
        className={`text-lg ${isActive ? "text-green-600" : "text-gray-400"
          }`}
      />
    );
  };

  return (
    <NavLink
      to={to}
      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${isActive
        ? "bg-green-500 text-white shadow-sm"
        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        }`}
    >
      {getIconNode()}
      <span>{label}</span>
    </NavLink>
  );
};

export default SidebarItem;
