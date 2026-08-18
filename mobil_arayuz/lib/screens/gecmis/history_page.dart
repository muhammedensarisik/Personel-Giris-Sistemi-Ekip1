import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobil_arayuz/services/historyService.dart';
import '../../model/history_model.dart';
import 'widgets/history_app_bar.dart';
import 'widgets/history_card.dart';
import 'widgets/history_empty_state.dart';

class HistoryPage extends StatefulWidget {
  const HistoryPage({super.key});

  @override
  State<HistoryPage> createState() => _HistoryPageState();
}

class _HistoryPageState extends State<HistoryPage> {
  final HistoryService _service = HistoryService();

  bool _isLoading = true;
  String? _errorMessage;
  List<HistoryModel> _historyList = [];

  String _filterStatus = "Tümü";
  DateTime? _selectedDate;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    
    if (!mounted) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final data = await _service.fetchHistory();

      if (!mounted) return;

      if (mounted) { 

        if (!mounted) return;

        setState(() {
          _historyList = data;
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = "Kayıtlar yüklenemedi";
        _isLoading = false;
      });
    }
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now(),
      firstDate: DateTime(2025),
      lastDate: DateTime.now(),
    );
    if (picked != null) setState(() => _selectedDate = picked);
  }

  void _clearDate() {
    setState(() => _selectedDate = null);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("Tarih filtresi temizlendi")),
    );
  }

  List<HistoryModel> get _filteredList {
    return _historyList.where((item) {
      final statusMatch = _filterStatus == "Tümü" || item.status == _filterStatus;
      final dateMatch = _selectedDate == null ||
          item.date == DateFormat('dd.MM.yyyy').format(_selectedDate!);
      return statusMatch && dateMatch;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: HistoryAppBar(
        selectedDate: _selectedDate,
        onDateTap: _pickDate,
        onDateClear: _clearDate,
        onFilterSelected: (val) => setState(() => _filterStatus = val),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_errorMessage != null) {
      return Center(child: Text(_errorMessage!));
    }
    if (_filteredList.isEmpty) {
      return const HistoryEmptyState();
    }
    
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    return RefreshIndicator(
      onRefresh: _loadHistory,
      child: ListView.builder(
        padding: EdgeInsets.fromLTRB(16, 16, 16, 10 + bottomPadding),
        itemCount: _filteredList.length,
        itemBuilder: (context, index) => HistoryCard(item: _filteredList[index]),
      ),
    );
  }
}