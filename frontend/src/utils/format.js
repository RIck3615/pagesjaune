// Utilitaires de formatage
export const formatUtils = {
  // Formater la devise (Franc congolais FC)
  currency: (amount) => {
    return new Intl.NumberFormat('fr-CD', {
      style: 'currency',
      currency: 'CDF',
      minimumFractionDigits: 0,
    }).format(amount).replace('CDF', 'FC');
  },

  // Formater un numéro de téléphone
  phone: (phone) => {
    if (!phone) return '';
    // Format congolais: +243 XXX XXX XXX
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('243')) {
      return `+${cleaned}`;
    }
    return phone;
  },

  // Formater une date
  date: (date, options = {}) => {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Intl.DateTimeFormat('fr-CD', { ...defaultOptions, ...options }).format(new Date(date));
  },

  // Formater une date relative
  relativeDate: (date) => {
    const now = new Date();
    const targetDate = new Date(date);
    const diffInSeconds = Math.floor((now - targetDate) / 1000);

    if (diffInSeconds < 60) {
      return 'Il y a quelques secondes';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    } else {
      return formatUtils.date(date);
    }
  },

  // Tronquer un texte
  truncate: (text, length = 100) => {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  },

  // Formater une note (étoiles)
  rating: (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return {
      full: fullStars,
      half: hasHalfStar,
      empty: emptyStars,
    };
  },

  // Formater les heures d'ouverture
  openingHours: (hours) => {
    if (!hours || typeof hours !== 'object') return null;
    
    const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
    const formatted = [];
    
    days.forEach(day => {
      if (hours[day]) {
        formatted.push(`${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours[day]}`);
      }
    });
    
    return formatted;
  },

  // Formater une adresse complète
  address: (business) => {
    if (!business) return '';
    const parts = [business.address, business.city, business.province].filter(Boolean);
    return parts.join(', ');
  },
};

