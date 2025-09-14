import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Upload,
  X,
  Plus
} from 'lucide-react';
import { businessService, categoryService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { getImageUrl } from '../../utils/images'; // AJOUTER CETTE LIGNE
import toast from 'react-hot-toast';

const BusinessForm = ({ business = null, isEdit = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    province: '',
    latitude: '',
    longitude: '',
    opening_hours: {
      monday: { open: '', close: '', closed: false },
      tuesday: { open: '', close: '', closed: false },
      wednesday: { open: '', close: '', closed: false },
      thursday: { open: '', close: '', closed: false },
      friday: { open: '', close: '', closed: false },
      saturday: { open: '', close: '', closed: false },
      sunday: { open: '', close: '', closed: false }
    }
  });
  // Ajouter des états pour la gestion des images
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // Pour les images existantes
  const [imagesToDelete, setImagesToDelete] = useState([]); // Pour les images à supprimer
  const [errors, setErrors] = useState({});

  // Villes populaires en RDC
  const cities = [
    'Kinshasa', 'Lubumbashi', 'Mbuji-Mayi', 'Kananga', 'Kisangani',
    'Bukavu', 'Goma', 'Matadi', 'Kikwit', 'Tshikapa',
    'Kolwezi', 'Likasi', 'Kalemie', 'Mbandaka', 'Uvira'
  ];

  const provinces = [
    'Kinshasa', 'Kongo-Central', 'Kwango', 'Kwilu', 'Mai-Ndombe',
    'Kasaï', 'Kasaï-Central', 'Kasaï-Oriental', 'Lomami', 'Sankuru',
    'Maniema', 'Sud-Kivu', 'Nord-Kivu', 'Ituri', 'Haut-Uele',
    'Bas-Uele', 'Tshopo', 'Haut-Lomami', 'Lualaba', 'Haut-Katanga',
    'Tanganyika', 'Mongala', 'Nord-Ubangi', 'Sud-Ubangi', 'Équateur'
  ];

  useEffect(() => {
    loadCategories();
    console.log('=== DEBUG USEEFFECT ===');
    console.log('isEdit:', isEdit);
    console.log('business:', business);
    
    if (isEdit && business) {
      console.log('Chargement des données de l\'entreprise...');
      console.log('business.name:', business.name);
      console.log('business.description:', business.description);
      // Convertir les heures d'ouverture du backend vers la structure du formulaire
      let openingHours = {
        monday: { open: '', close: '', closed: false },
        tuesday: { open: '', close: '', closed: false },
        wednesday: { open: '', close: '', closed: false },
        thursday: { open: '', close: '', closed: false },
        friday: { open: '', close: '', closed: false },
        saturday: { open: '', close: '', closed: false },
        sunday: { open: '', close: '', closed: false }
      };

      if (business.opening_hours && Array.isArray(business.opening_hours)) {
        const dayMapping = {
          'lundi': 'monday',
          'mardi': 'tuesday',
          'mercredi': 'wednesday',
          'jeudi': 'thursday',
          'vendredi': 'friday',
          'samedi': 'saturday',
          'dimanche': 'sunday'
        };

        business.opening_hours.forEach(dayData => {
          const dayKey = dayMapping[dayData.day];
          if (dayKey) {
            openingHours[dayKey] = {
              open: dayData.open_time || '',
              close: dayData.close_time || '',
              closed: !dayData.is_open || dayData.is_open === '0' || dayData.is_open === 0
            };
          }
        });
      }

      const newFormData = {
        name: business.name || '',
        description: business.description || '',
        email: business.email || '',
        phone: business.phone || '',
        website: business.website || '',
        address: business.address || '',
        city: business.city || '',
        province: business.province || '',
        latitude: business.latitude || '',
        longitude: business.longitude || '',
        opening_hours: openingHours
      };
      
      console.log('Nouveau formData:', newFormData);
      setFormData(newFormData);
      
      setSelectedCategories(business.categories?.map(cat => cat.id) || []);
      
      if (business.logo) {
        setLogoPreview(getImageUrl(business.logo));
      }
      
      if (business.images && business.images.length > 0) {
        setExistingImages(business.images); // Stocker juste les chemins, pas les URLs complètes
      }
    } else {
      console.log('Pas en mode édition ou business non défini');
    }
  }, [business, isEdit]);

  const loadCategories = async () => {
    try {
      console.log('🔄 Chargement des catégories...');
      // Récupérer toutes les catégories (racines et sous-catégories)
      const response = await categoryService.getAll({ root_only: false });
      console.log('✅ Réponse API catégories:', response);
      console.log('📋 Catégories chargées:', response.data.data);
      console.log('📊 Nombre de catégories:', response.data.data?.length || 0);
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des catégories:', error);
      console.error('📄 Détails de l\'erreur:', error.response?.data);
      toast.error('Erreur lors du chargement des catégories');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleOpeningHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: {
          ...prev.opening_hours[day],
          [field]: value
        }
      }
    }));
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => {
      const newSelection = prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId];
      console.log('️ Catégories sélectionnées:', newSelection);
      return newSelection;
    });
  };

  // Améliorer la gestion du changement de logo
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validation de la taille (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Le logo ne doit pas dépasser 2MB');
        return;
      }
      
      // Validation du type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Format de fichier non supporté. Utilisez JPEG, PNG ou GIF');
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Améliorer la gestion des images multiples
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validation des fichiers
    const validFiles = [];
    files.forEach(file => {
      // Validation de la taille (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`L'image ${file.name} ne doit pas dépasser 2MB`);
        return;
      }
      
      // Validation du type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Format non supporté pour ${file.name}. Utilisez JPEG, PNG ou GIF`);
        return;
      }

      validFiles.push(file);
    });

    // Limiter à 5 images maximum
    const totalImages = imageFiles.length + validFiles.length;
    if (totalImages > 5) {
      toast.error('Vous ne pouvez pas ajouter plus de 5 images');
      return;
    }

    setImageFiles(prev => [...prev, ...validFiles]);
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreviews(prev => [...prev, e.target.result]);
      reader.readAsDataURL(file);
    });
  };

  // Fonction pour supprimer une image (nouvelle ou existante)
  const removeImage = (index, isExisting = false) => {
    if (isExisting) {
      // Marquer l'image existante pour suppression
      const imageToDelete = existingImages[index];
      setImagesToDelete(prev => [...prev, imageToDelete]);
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      // Supprimer une nouvelle image
      setImageFiles(prev => prev.filter((_, i) => i !== index));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // DEBUG: Vérifier l'état avant de créer FormData
      console.log('=== ÉTAT COMPLET AVANT ENVOI ===');
      console.log('formData:', formData);
      console.log('selectedCategories:', selectedCategories);
      console.log('logoFile:', logoFile);
      console.log('imageFiles:', imageFiles);
      console.log('existingImages:', existingImages);
      console.log('imagesToDelete:', imagesToDelete);
      console.log('isEdit:', isEdit);
      console.log('business.id:', business?.id);

      const data = new FormData();
      
      // DEBUG: Vérifier chaque étape
      console.log('=== CRÉATION FORMDATA ===');
      
      // Ajouter les données de base
      Object.keys(formData).forEach(key => {
        console.log(`Traitement de ${key}:`, formData[key]);
        if (key === 'opening_hours') {
          // Convertir l'objet opening_hours en tableau
          const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
          const dayNames = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
          
          days.forEach((day, index) => {
            const hours = formData.opening_hours[day];
            if (hours) {
              data.append(`opening_hours[${index}][day]`, dayNames[index]);
              data.append(`opening_hours[${index}][is_open]`, hours.closed ? '0' : '1');
              data.append(`opening_hours[${index}][open_time]`, hours.open || '');
              data.append(`opening_hours[${index}][close_time]`, hours.close || '');
              console.log(`Ajouté opening_hours[${index}]:`, dayNames[index], hours);
            }
          });
        } else if (formData[key] !== '') {
          data.append(key, formData[key]);
          console.log(`Ajouté ${key}:`, formData[key]);
        } else {
          console.log(`Ignoré ${key} (vide):`, formData[key]);
        }
      });

      // Ajouter les catégories
      console.log('Ajout des catégories:', selectedCategories);
      selectedCategories.forEach(categoryId => {
        data.append('category_ids[]', categoryId);
        console.log(`Ajouté category_ids[]:`, categoryId);
      });

      // Ajouter le logo s'il y en a un nouveau
      if (logoFile) {
        data.append('logo', logoFile);
        console.log('Ajouté logo:', logoFile);
      } else {
        console.log('Pas de logo à ajouter');
      }

      // Ajouter les nouvelles images
      console.log('Ajout des nouvelles images:', imageFiles);
      imageFiles.forEach((image, index) => {
        if (image instanceof File) {
          data.append(`images[${index}]`, image);
          console.log(`Ajouté images[${index}]:`, image);
        }
      });

      // Ajouter les images existantes à conserver
      console.log('Ajout des images existantes:', existingImages);
      if (isEdit && existingImages.length > 0) {
        existingImages.forEach((image, index) => {
          data.append(`existing_images[${index}]`, image);
          console.log(`Ajouté existing_images[${index}]:`, image);
        });
      } else {
        console.log('Pas d\'images existantes à ajouter');
      }

      // Ajouter les images à supprimer
      console.log('Ajout des images à supprimer:', imagesToDelete);
      if (isEdit && imagesToDelete.length > 0) {
        imagesToDelete.forEach((imagePath, index) => {
          data.append(`images_to_delete[${index}]`, imagePath);
          console.log(`Ajouté images_to_delete[${index}]:`, imagePath);
        });
      } else {
        console.log('Pas d\'images à supprimer');
      }

      // DEBUG: Afficher toutes les données FormData
      console.log('=== DONNÉES FORMDATA FINALES ===');
      for (let [key, value] of data.entries()) {
        console.log(`${key}:`, value);
      }
      console.log('=== FIN DEBUG ===');

      let response;
      if (isEdit && business) {
        console.log('Mode édition - Appel update');
        response = await businessService.update(business.id, data);
        toast.success('Entreprise mise à jour avec succès');
      } else {
        console.log('Mode création - Appel create');
        response = await businessService.create(data);
        toast.success('Entreprise créée avec succès');
      }

      navigate('/my-businesses');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      
      // Afficher les erreurs de validation détaillées
      if (error.response?.data?.errors) {
        console.error('Erreurs de validation:', error.response.data.errors);
        setErrors(error.response.data.errors);
        toast.error('Veuillez corriger les erreurs dans le formulaire');
      } else {
        console.error('Erreur complète:', error.response?.data);
        toast.error('Erreur lors de la sauvegarde de l\'entreprise');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour afficher les catégories de manière hiérarchique
  const renderCategories = (categories, level = 0) => {
    return categories.map(category => (
      <div key={category.id} className={`${level > 0 ? 'ml-4' : ''}`}>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedCategories.includes(category.id)}
            onChange={() => handleCategoryToggle(category.id)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className={`text-sm ${level > 0 ? 'text-gray-600' : 'text-gray-700 font-medium'}`}>
            {category.name}
          </span>
        </label>
        {category.children && category.children.length > 0 && (
          <div className="mt-2">
            {renderCategories(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="max-w-4xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            {isEdit ? 'Modifier l\'entreprise' : 'Créer une nouvelle entreprise'}
          </h1>
          <p className="text-gray-600">
            {isEdit 
              ? 'Mettez à jour les informations de votre entreprise'
              : 'Ajoutez votre entreprise pour augmenter votre visibilité'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations de base */}
          <div className="space-y-6">
            <h2 className="flex items-center text-xl font-semibold text-gray-900">
              <Building2 className="w-5 h-5 mr-2 text-blue-600" />
              Informations de base
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Nom de l'entreprise *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Restaurant Le Délicieux"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="contact@entreprise.cd"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Décrivez votre entreprise, ses services, son histoire..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+243 XXX XXX XXX"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone[0]}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Site web
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.website ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://www.entreprise.cd"
                />
                {errors.website && (
                  <p className="mt-1 text-sm text-red-600">{errors.website[0]}</p>
                )}
              </div>
            </div>
          </div>

          {/* Localisation */}
          <div className="space-y-6">
            <h2 className="flex items-center text-xl font-semibold text-gray-900">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              Localisation
            </h2>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Adresse *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Avenue Kasa-Vubu, Commune de la Gombe"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Ville *
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner une ville</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city[0]}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Province *
                </label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.province ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner une province</option>
                  {provinces.map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
                {errors.province && (
                  <p className="mt-1 text-sm text-red-600">{errors.province[0]}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Latitude (optionnel)
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.latitude ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: -4.4419"
                />
                {errors.latitude && (
                  <p className="mt-1 text-sm text-red-600">{errors.latitude[0]}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Longitude (optionnel)
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.longitude ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: 15.2663"
                />
                {errors.longitude && (
                  <p className="mt-1 text-sm text-red-600">{errors.longitude[0]}</p>
                )}
              </div>
            </div>
          </div>

          {/* Catégories */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Catégories * ({selectedCategories.length} sélectionnées)
            </h2>
            <div className="p-4 overflow-y-auto border border-gray-200 rounded-lg max-h-64">
              {categories.length > 0 ? (
                renderCategories(categories)
              ) : (
                <div className="py-4 text-center text-gray-500">
                  Chargement des catégories...
                </div>
              )}
            </div>
            {errors.category_ids && (
              <p className="mt-1 text-sm text-red-600">{errors.category_ids[0]}</p>
            )}
            {selectedCategories.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm text-gray-600">
                  Catégories sélectionnées ({selectedCategories.length}) :
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map(categoryId => {
                    const category = categories.find(cat => cat.id === categoryId) || 
                                   categories.find(cat => cat.children?.some(child => child.id === categoryId))?.children?.find(child => child.id === categoryId);
                    return category ? (
                      <span
                        key={categoryId}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full"
                      >
                        {category.name}
                        <button
                          type="button"
                          onClick={() => handleCategoryToggle(categoryId)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Images */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Images
            </h2>

            {/* Logo */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Logo
              </label>
              <div className="flex items-center space-x-4">
                {logoPreview && (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="object-cover w-20 h-20 border rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview(null);
                      }}
                      className="absolute p-1 text-white bg-red-500 rounded-full -top-2 -right-2 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <div className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Upload className="w-4 h-4 mr-2" />
                    {logoFile ? 'Changer le logo' : 'Choisir un logo'}
                  </div>
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Format accepté: JPEG, PNG, GIF. Taille max: 2MB
              </p>
            </div>

            {/* Images multiples */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Photos de l'entreprise ({imageFiles.length + existingImages.length}/5)
              </label>
              
              {/* Images existantes (en mode édition) */}
              {isEdit && existingImages.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 text-sm text-gray-600">Images existantes:</p>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {existingImages.map((image, index) => (
                      <div key={`existing-${index}`} className="relative">
                        <img
                          src={getImageUrl(image)} // Utiliser getImageUrl ici
                          alt={`Existing ${index + 1}`}
                          className="object-cover w-full h-24 border rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index, true)}
                          className="absolute p-1 text-white bg-red-500 rounded-full -top-2 -right-2 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nouvelles images */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="object-cover w-full h-24 border rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index, false)}
                      className="absolute p-1 text-white bg-red-500 rounded-full -top-2 -right-2 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {/* Bouton d'ajout d'images */}
                {imageFiles.length + existingImages.length < 5 && (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagesChange}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50">
                      <Plus className="w-6 h-6 text-gray-400" />
                      <span className="text-xs text-gray-500">Ajouter</span>
                    </div>
                  </label>
                )}
              </div>
              
              <p className="mt-1 text-xs text-gray-500">
                Format accepté: JPEG, PNG, GIF. Taille max: 2MB par image. Maximum 5 images.
              </p>
            </div>
          </div>

          {/* Horaires d'ouverture */}
          <div className="space-y-6">
            <h2 className="flex items-center text-xl font-semibold text-gray-900">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Horaires d'ouverture
            </h2>
            <div className="space-y-4">
              {Object.entries(formData.opening_hours).map(([day, hours]) => (
                <div key={day} className="flex items-center space-x-4">
                  <div className="w-24 text-sm font-medium text-gray-700 capitalize">
                    {day === 'monday' ? 'Lundi' :
                     day === 'tuesday' ? 'Mardi' :
                     day === 'wednesday' ? 'Mercredi' :
                     day === 'thursday' ? 'Jeudi' :
                     day === 'friday' ? 'Vendredi' :
                     day === 'saturday' ? 'Samedi' : 'Dimanche'}
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={hours.closed}
                      onChange={(e) => handleOpeningHoursChange(day, 'closed', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Fermé</span>
                  </div>
                  {!hours.closed && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) => handleOpeningHoursChange(day, 'open', e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) => handleOpeningHoursChange(day, 'close', e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end pt-6 space-x-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/my-businesses')}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sauvegarde...' : (isEdit ? 'Mettre à jour' : 'Créer l\'entreprise')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessForm;
