import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  MessageCircle, 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  CreditCard,
  FileText,
  Bell,
  Database,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AdminSidebar = ({ isOpen, onClose, activeSection, onSectionChange }) => {
  const { logout } = useAuth();

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Tableau de bord',
      icon: LayoutDashboard,
      description: 'Vue d\'ensemble du système'
    },
    {
      id: 'businesses',
      title: 'Entreprises',
      icon: Building2,
      description: 'Gestion des entreprises'
    },
    {
      id: 'reviews',
      title: 'Avis & Modération',
      icon: MessageCircle,
      description: 'Modération des avis'
    },
    {
      id: 'users',
      title: 'Utilisateurs',
      icon: Users,
      description: 'Gestion des utilisateurs'
    },
    {
      id: 'subscriptions',
      title: 'Abonnements',
      icon: CreditCard,
      description: 'Gestion des abonnements'
    },
    {
      id: 'reports',
      title: 'Rapports',
      icon: BarChart3,
      description: 'Rapports et statistiques'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      description: 'Centre de notifications'
    },
    {
      id: 'system',
      title: 'Système',
      icon: Database,
      description: 'Configuration système'
    },
    {
      id: 'settings',
      title: 'Paramètres',
      icon: Settings,
      description: 'Paramètres généraux'
    }
  ];

  const handleLogout = async () => {
    await logout();
  };

  const handleSectionChange = (sectionId) => {
    onSectionChange(sectionId);
    onClose(); // Fermer la sidebar sur mobile après sélection
  };

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Admin</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 rounded-md lg:hidden hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id)}
                  className={`
                    flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 group text-left
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`
                    w-5 h-5 mr-3 transition-colors duration-200
                    ${isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'}
                  `} />
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 transition-colors duration-200 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
