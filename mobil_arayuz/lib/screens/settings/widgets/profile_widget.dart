import 'package:flutter/material.dart';

class ProfileWidget extends StatelessWidget {
  const ProfileWidget({super.key});

  @override
  Widget build(BuildContext context) {
    // 1. Temayı ve renk şemasını context üzerinden yakalıyoruz
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Column(
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 30),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            // 2. Sabit renkler yerine temanın primary (ana) rengiyle dinamik gradient
            gradient: LinearGradient(
              colors: [
                colorScheme.primary,
                colorScheme.primary.withValues(alpha: 0.7),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  // 3. Sabit Colors.white yerine temanın arka plan (surface) rengi
                  color: colorScheme.surface, 
                  shape: BoxShape.circle,
                ),
                child: const CircleAvatar(
                  radius: 48,
                  // İleride buraya: backgroundImage: NetworkImage(kullanici.fotoUrl) gelecek
                ),
              ),
              const SizedBox(height: 16),
              Text(
                "Ramazan Detseli",
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  // 4. Ana rengin üzerinde okunabilmesi için zıt renk (onPrimary)
                  color: colorScheme.onPrimary, 
                ),
              ),          
              Text(
                "Yazılım Mühendisliği Stajyeri",
                style: TextStyle(
                  fontSize: 15,
                  // Alt başlık için yine zıt rengin hafif saydam hali
                  color: colorScheme.onPrimary.withValues(alpha: 0.9), 
                ),
              )              
            ],
          )
        ),
        const SizedBox(height: 20),

        Card(
          elevation: 1,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          // Card arka planı otomatik olarak colorScheme.surface olur, ek müdahaleye gerek yok
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                _buildProfileRow(context, "Departman", "Bilgi İşlem / Yazılım"),
                const Divider(),
                _buildProfileRow(context, "Görev", "Yazılım Stajyeri"),
                const Divider(),
                _buildProfileRow(context, "E-posta", "ramazan@example.com"),
                const Divider(),
                _buildProfileRow(context, "Telefon", "0532 123 45 67"),
              ],
            ),
          ),
        )
      ],
    );
  }

  // 5. BuildContext'i parametre olarak aldık ki temanın yazı renklerine ulaşabilelim
  Widget _buildProfileRow(BuildContext context, String label, String value) {
    final theme = Theme.of(context);
    
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label, 
            style: TextStyle(
              // Sabit gri yerine, temanın kendi metin renginin saydam hali (koyuda açık, açıkta koyu gri olur)
              color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.6), 
            )
          ),
          Text(
            value, 
            style: const TextStyle(fontWeight: FontWeight.bold)
            // Value kısmı temanın ana yazı rengini (siyah/beyaz) otomatik alır
          ),
        ],
      ),
    );
  }
}