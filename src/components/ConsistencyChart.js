import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors, fontSize, spacing } from '../constants/theme';
import { getWeekDates, getDaysInRange } from '../utils/helpers';

export default function ConsistencyChart({ logs, days = 30 }) {
  const today = new Date();
  const chartDates = getDaysInRange(
    new Date(today.getTime() - (days - 1) * 86400000).toISOString().split('T')[0],
    days
  );

  const dataPoints = chartDates.map((date) => {
    const entry = logs[date];
    if (!entry) return 0;
    if (entry === true) return 1;
    if (typeof entry === 'object' && entry.count > 0) return 1;
    return 0;
  });

  const labels = chartDates
    .filter((_, i) => i % Math.max(1, Math.floor(days / 7)) === 0)
    .map((d) => {
      const dt = new Date(d + 'T00:00:00');
      return `${dt.getMonth() + 1}/${dt.getDate()}`;
    });

  if (dataPoints.every((v) => v === 0)) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No data yet. Start checking in!</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width - spacing.xl * 2 - spacing.lg * 2;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consistency (Last {days} Days)</Text>
      <LineChart
        data={{
          labels,
          datasets: [{ data: dataPoints, color: () => colors.primary }],
        }}
        width={screenWidth}
        height={160}
        yAxisSuffix=""
        yAxisInterval={1}
        fromZero
        withInnerLines={false}
        withOuterLines={false}
        chartConfig={{
          backgroundColor: colors.surface,
          backgroundGradientFrom: colors.surface,
          backgroundGradientTo: colors.surface,
          decimalCount: 0,
          color: () => colors.primary,
          labelColor: () => colors.textMuted,
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: colors.primary,
          },
          propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: colors.surfaceLight,
          },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  chart: {
    borderRadius: 10,
  },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
});
