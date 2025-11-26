import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import customerApi from '../../api/customerApi';

const FounderBenefitsScreen = () => {
  const [referralCode, setReferralCode] = useState('');
  const [friendCount, setFriendCount] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await customerApi.getLoyaltyStatus();
        if (data?.loyalty) {
          setReferralCode(data.loyalty.referralCode || '');
          setFriendCount(data.loyalty.referralCount || 0);
          if (typeof data.discountPercent === 'number') setDiscountPercent(data.discountPercent);
        }
      } catch (e) {
        console.warn('Failed to load loyalty status', e);
      }
    };
    load();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Founder Benefits / مزايا المؤسسين</Text>

      <View style={styles.card}>
        <Text style={styles.heading}>Your referral code / كود الإحالة الخاص بك</Text>
        <Text style={styles.value}>{referralCode || '—'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Friends joined / عدد الأصدقاء المنضمين</Text>
        <Text style={styles.value}>{friendCount}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Discounts / الخصومات</Text>
        <Text style={styles.value}>{discountPercent}% off rides</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Grandfathering / نظام الاستحقاق الدائم</Text>
        <Text style={styles.text}>
          As a founder, your early discounts and perks are &quot;grandfathered&quot; in. This means you keep
          your benefits even as prices and plans change for new users. Founders are always on the
          best plan.
        </Text>
        <Text style={styles.text}>
          كمؤسس، يتم تثبيت مزاياك وخصوماتك المبكرة. هذا يعني أنك تحتفظ بمزاياك حتى لو تغيرت
          الأسعار والباقات للمستخدمين الجدد. المؤسسون دائمًا على أفضل باقة.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  heading: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
  },
  text: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default FounderBenefitsScreen;

