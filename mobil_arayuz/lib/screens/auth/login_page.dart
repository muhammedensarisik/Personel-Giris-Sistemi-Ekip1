import 'package:flutter/material.dart';
import 'package:mobil_arayuz/screens/auth/widgets/login_button.dart';
import 'package:mobil_arayuz/screens/auth/widgets/login_logo.dart';
import 'package:mobil_arayuz/screens/auth/widgets/login_text_field.dart';
import 'package:mobil_arayuz/services/auth_service.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _authService = AuthService();
  bool _isLoading = false;

  @override
  void dispose() {
    // Bellek sızıntısını (Memory Leak) ve kasmayı önlemek için controller'ları temizliyoruz
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (_emailController.text.trim().isEmpty || _passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Lütfen tüm alanları doldurun.")),
      );
      return;
    }

    setState(() => _isLoading = true);

    String? errorMessage = await _authService.login(
      _emailController.text.trim(), 
      _passwordController.text,
    );

    if (!mounted) return;

    if (errorMessage == null) {
      Navigator.pushReplacementNamed(context, '/main');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(errorMessage)),
      );
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      // Klavyenin yeniden çizimde kasma yapmasını engeller:
      resizeToAvoidBottomInset: true, 
      backgroundColor: theme.scaffoldBackgroundColor,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            // Ekran kaydırıldığında klavyeyi kapatır (Performansı artırır)
            keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag, 
            padding: const EdgeInsets.symmetric(horizontal: 24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // const eklendi ki tema değişiminde sıfırdan çizilmesin (Performans için kritik!)
                const LoginLogo(),
                const SizedBox(height: 40),
                LoginTextField(
                  controller: _emailController,
                  hint: "E-posta Adresi",
                  icon: Icons.email_outlined,
                ),
                const SizedBox(height: 16),
                LoginTextField(
                  controller: _passwordController,
                  hint: "Şifre",
                  icon: Icons.lock_outline,
                  isPassword: true,
                ),
                const SizedBox(height: 32),
                LoginButton(
                  onPressed: _handleLogin, 
                  isLoading: _isLoading,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}