import 'package:flutter/material.dart';

class AppContainer extends StatelessWidget {
  final Widget child; // İçine koyacağımız içerik (Text, Column, Row vs.)
  final EdgeInsetsGeometry? padding; // İç boşluk
  final EdgeInsetsGeometry? margin; // Dış boşluk
  final double borderRadius; // Köşe yuvarlaklığı
  final bool hasShadow; // İstediğimizde gölgeyi açıp kapatabilelim
  final Color? backgroundColor; // İstersek özel arka plan rengi atayabilelim

  const AppContainer({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16.0), // Varsayılan iç boşluk
    this.margin,
    this.borderRadius = 20.0, // Varsayılan köşe yumuşaklığımız
    this.hasShadow = false, // Varsayılan olarak gölgesiz (daha sade)
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      margin: margin,
      padding: padding,
      decoration: BoxDecoration(
        color: backgroundColor ?? (isDark ? Colors.grey.shade900 : Colors.white),
        borderRadius: BorderRadius.circular(borderRadius),
        // Projenin standart çerçevesi
        border: Border.all(
          color: theme.dividerColor.withValues(alpha: isDark ? 0.2 : 0.4),
        ),
        // İstersek gölgeyi true gönderip aktif edebiliriz
        boxShadow: hasShadow
            ? [
                BoxShadow(
                  color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ]
            : null,
      ),
      child: child,
    );
  }
}