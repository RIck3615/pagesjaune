<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            // Services professionnels
            [
                'name' => 'Services professionnels',
                'slug' => 'services-professionnels',
                'description' => 'Services professionnels et conseils',
                'icon' => 'briefcase',
                'children' => [
                    ['name' => 'Avocats', 'slug' => 'avocats', 'description' => 'Services juridiques et conseils légaux'],
                    ['name' => 'Comptables', 'slug' => 'comptables', 'description' => 'Services comptables et fiscaux'],
                    ['name' => 'Architectes', 'slug' => 'architectes', 'description' => 'Conception et construction'],
                    ['name' => 'Ingénieurs', 'slug' => 'ingenieurs', 'description' => 'Services d\'ingénierie'],
                ]
            ],

            // Santé et bien-être
            [
                'name' => 'Santé et bien-être',
                'slug' => 'sante-bien-etre',
                'description' => 'Services de santé et bien-être',
                'icon' => 'heart',
                'children' => [
                    ['name' => 'Médecins', 'slug' => 'medecins', 'description' => 'Services médicaux'],
                    ['name' => 'Dentistes', 'slug' => 'dentistes', 'description' => 'Soins dentaires'],
                    ['name' => 'Pharmacies', 'slug' => 'pharmacies', 'description' => 'Médicaments et produits de santé'],
                    ['name' => 'Hôpitaux', 'slug' => 'hopitaux', 'description' => 'Soins hospitaliers'],
                ]
            ],

            // Restaurants et alimentation
            [
                'name' => 'Restaurants et alimentation',
                'slug' => 'restaurants-alimentation',
                'description' => 'Restaurants, bars et services alimentaires',
                'icon' => 'utensils',
                'children' => [
                    ['name' => 'Restaurants', 'slug' => 'restaurants', 'description' => 'Restaurants et cafés'],
                    ['name' => 'Fast-food', 'slug' => 'fast-food', 'description' => 'Restauration rapide'],
                    ['name' => 'Boulangeries', 'slug' => 'boulangeries', 'description' => 'Pain et pâtisseries'],
                    ['name' => 'Supermarchés', 'slug' => 'supermarches', 'description' => 'Épiceries et supermarchés'],
                ]
            ],

            // Automobile et transport
            [
                'name' => 'Automobile et transport',
                'slug' => 'automobile-transport',
                'description' => 'Services automobiles et transport',
                'icon' => 'car',
                'children' => [
                    ['name' => 'Garages', 'slug' => 'garages', 'description' => 'Réparation automobile'],
                    ['name' => 'Concessionnaires', 'slug' => 'concessionnaires', 'description' => 'Vente de véhicules'],
                    ['name' => 'Location de voitures', 'slug' => 'location-voitures', 'description' => 'Location de véhicules'],
                    ['name' => 'Taxi', 'slug' => 'taxi', 'description' => 'Services de taxi'],
                ]
            ],

            // Éducation et formation
            [
                'name' => 'Éducation et formation',
                'slug' => 'education-formation',
                'description' => 'Écoles, universités et formation',
                'icon' => 'graduation-cap',
                'children' => [
                    ['name' => 'Écoles primaires', 'slug' => 'ecoles-primaires', 'description' => 'Enseignement primaire'],
                    ['name' => 'Écoles secondaires', 'slug' => 'ecoles-secondaires', 'description' => 'Enseignement secondaire'],
                    ['name' => 'Universités', 'slug' => 'universites', 'description' => 'Enseignement supérieur'],
                    ['name' => 'Centres de formation', 'slug' => 'centres-formation', 'description' => 'Formation professionnelle'],
                ]
            ],

            // Immobilier
            [
                'name' => 'Immobilier',
                'slug' => 'immobilier',
                'description' => 'Vente et location immobilière',
                'icon' => 'home',
                'children' => [
                    ['name' => 'Agences immobilières', 'slug' => 'agences-immobilieres', 'description' => 'Vente et location'],
                    ['name' => 'Promoteurs', 'slug' => 'promoteurs', 'description' => 'Construction immobilière'],
                    ['name' => 'Notaires', 'slug' => 'notaires', 'description' => 'Services notariaux'],
                ]
            ],

            // Technologie et informatique
            [
                'name' => 'Technologie et informatique',
                'slug' => 'technologie-informatique',
                'description' => 'Services informatiques et technologiques',
                'icon' => 'laptop',
                'children' => [
                    ['name' => 'Développement web', 'slug' => 'developpement-web', 'description' => 'Création de sites web'],
                    ['name' => 'Maintenance informatique', 'slug' => 'maintenance-informatique', 'description' => 'Réparation et maintenance'],
                    ['name' => 'Télécommunications', 'slug' => 'telecommunications', 'description' => 'Services de télécommunication'],
                ]
            ],

            // Beauté et bien-être
            [
                'name' => 'Beauté et bien-être',
                'slug' => 'beaute-bien-etre',
                'description' => 'Salons de beauté et bien-être',
                'icon' => 'spa',
                'children' => [
                    ['name' => 'Salons de coiffure', 'slug' => 'salons-coiffure', 'description' => 'Coiffure et soins capillaires'],
                    ['name' => 'Instituts de beauté', 'slug' => 'instituts-beaute', 'description' => 'Soins esthétiques'],
                    ['name' => 'Salles de sport', 'slug' => 'salles-sport', 'description' => 'Fitness et musculation'],
                ]
            ],
        ];

        foreach ($categories as $categoryData) {
            $children = $categoryData['children'] ?? [];
            unset($categoryData['children']);

            $category = Category::create($categoryData);

            foreach ($children as $childData) {
                Category::create([
                    ...$childData,
                    'parent_id' => $category->id,
                ]);
            }
        }
    }
}

