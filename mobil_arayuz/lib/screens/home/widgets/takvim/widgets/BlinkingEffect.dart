import 'package:flutter/material.dart';

class BlinkingEffect extends StatefulWidget {
  
  final Widget child;
  const BlinkingEffect({required this.child,super.key});

  @override
  State<BlinkingEffect> createState() => BlinkingEffectState();
}

class BlinkingEffectState extends State<BlinkingEffect> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    // 1 saniyelik şeffaflaşıp geri gelme animasyonu (Sürekli tekrar eder)
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _controller.drive(Tween(begin: 0.4, end: 1.0)),
      child: widget.child,
    );
  }
}