<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\PasswordReset;
use App\Models\User;

class PasswordResetController extends Controller
{
    /**
     * Envoyer un lien de réinitialisation de mot de passe
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ], [
            'email.required' => 'L\'adresse e-mail est requise.',
            'email.email' => 'L\'adresse e-mail n\'est pas valide.',
            'email.exists' => 'Aucun compte trouvé avec cette adresse e-mail.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        // Envoyer le lien de réinitialisation
        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'success' => true,
                'message' => 'Un lien de réinitialisation a été envoyé à votre adresse e-mail.'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Impossible d\'envoyer le lien de réinitialisation. Veuillez réessayer.'
        ], 500);
    }

    /**
     * Réinitialiser le mot de passe
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required',
            'email' => 'required|email|exists:users,email',
            'password' => 'required|min:8|confirmed',
        ], [
            'token.required' => 'Le token de réinitialisation est requis.',
            'email.required' => 'L\'adresse e-mail est requise.',
            'email.email' => 'L\'adresse e-mail n\'est pas valide.',
            'email.exists' => 'Aucun compte trouvé avec cette adresse e-mail.',
            'password.required' => 'Le mot de passe est requis.',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
            'password.confirmed' => 'Les mots de passe ne correspondent pas.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        // Réinitialiser le mot de passe
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'success' => true,
                'message' => 'Votre mot de passe a été réinitialisé avec succès.'
            ]);
        }

        // Gérer les différentes erreurs
        $errorMessage = match ($status) {
            Password::INVALID_TOKEN => 'Le lien de réinitialisation est invalide ou a expiré.',
            Password::INVALID_USER => 'Aucun compte trouvé avec cette adresse e-mail.',
            default => 'Une erreur est survenue lors de la réinitialisation du mot de passe.'
        };

        return response()->json([
            'success' => false,
            'message' => $errorMessage
        ], 400);
    }

    /**
     * Vérifier si un token de réinitialisation est valide
     */
    public function checkToken(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required',
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'valid' => false,
                'message' => 'Token ou email invalide.'
            ], 422);
        }

        // Vérifier si le token existe et n'est pas expiré
        $tokenExists = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->where('created_at', '>', now()->subHours(1))
            ->exists();

        return response()->json([
            'success' => true,
            'valid' => $tokenExists,
            'message' => $tokenExists
                ? 'Token valide.'
                : 'Token invalide ou expiré.'
        ]);
    }
}
