import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { KetchupCard } from '@/components/ui/KetchupCard';
import { KetchupNotification } from '@/components/KetchupNotification';
import Colors from '@/constants/colors';
import { useKetchupStore } from '@/store/ketchupStore';
import { useUserStore } from '@/store/userStore';
import { KetchupRequest } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const router = useRouter();
  const [showNotification, setShowNotification] = useState(false);
  const [activeNotification, setActiveNotification] = useState<KetchupRequest | null>(null);
  
  // Get data from stores
  const ketchups = useKetchupStore(state => state.ketchups);
  const matchKetchup = useKetchupStore(state => state.matchKetchup);
  const notifyFriend = useKetchupStore(state => state.notifyFriend);
  
  const user = useUserStore(state => state.user);
  
  // Derived state
  const pendingKetchups = ketchups.filter(k => k.status === 'pending');
  const matchedKetchups = ketchups.filter(k => k.status === 'matched');
  
  // Simulate receiving a ketchup request - only run this effect once on mount
  useEffect(() => {
    const incomingKetchup = pendingKetchups.find(k => 
      k.creatorId !== 'current-user' && 
      !k.notifiedFriends.includes('current-user')
    );
    
    if (incomingKetchup) {
      setActiveNotification(incomingKetchup);
      setShowNotification(true);
      
      // Mark as notified
      notifyFriend(incomingKetchup.id, 'current-user');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount
  
  const handleAcceptKetchup = () => {
    if (activeNotification) {
      matchKetchup(activeNotification.id, 'current-user');
      setShowNotification(false);
      setActiveNotification(null);
    }
  };
  
  const handleDeclineKetchup = () => {
    setShowNotification(false);
    setActiveNotification(null);
  };
  
  const handleKetchupPress = (ketchup: KetchupRequest) => {
    router.push(`/ketchup/${ketchup.id}`);
  };
  
  const handleCreateKetchup = () => {
    router.push('/create-ketchup');
  };
  
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateTitle}>No Ketchups Yet</Text>
      <Text style={styles.emptyStateText}>
        Evening's open—who's in?
      </Text>
      <Button 
        title="Create Ketchup" 
        onPress={handleCreateKetchup}
        style={styles.emptyStateButton}
        variant="gradient"
      />
    </View>
  );
  
  const renderSectionDivider = () => (
    <View style={styles.divider} />
  );
  
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hey, {user?.name.split(' ')[0] || 'there'}!
          </Text>
          <Text style={styles.subtitle}>
            Evening's open—who's in?
          </Text>
        </View>
        
        <View style={styles.createButtonContainer}>
          <Button
            title="Create Ketchup"
            size="large"
            onPress={handleCreateKetchup}
            variant="gradient"
            style={styles.createButton}
          />
        </View>
        
        {matchedKetchups.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Ketchups</Text>
            {renderSectionDivider()}
            <FlatList
              data={matchedKetchups}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <KetchupCard
                  ketchup={item}
                  onPress={handleKetchupPress}
                />
              )}
              scrollEnabled={false}
            />
          </View>
        )}
        
        {pendingKetchups.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Ketchups</Text>
            {renderSectionDivider()}
            <FlatList
              data={pendingKetchups.filter(k => k.creatorId === 'current-user')}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <KetchupCard
                  ketchup={item}
                  onPress={handleKetchupPress}
                />
              )}
              scrollEnabled={false}
              ListEmptyComponent={() => (
                <Text style={styles.noPendingText}>
                  No pending ketchups from you
                </Text>
              )}
            />
          </View>
        )}
        
        {pendingKetchups.length === 0 && matchedKetchups.length === 0 && renderEmptyState()}
      </ScrollView>
      
      {activeNotification && (
        <KetchupNotification
          ketchup={activeNotification}
          visible={showNotification}
          onAccept={handleAcceptKetchup}
          onDecline={handleDeclineKetchup}
          timeLeft={60} // 60 seconds
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ui.background,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  createButtonContainer: {
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: Colors.text.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  createButton: {
    width: '100%',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral.ecru,
    marginBottom: 16,
    width: '100%',
  },
  noPendingText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 40,
    backgroundColor: Colors.ui.card,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: Colors.neutral.ecru,
    ...Platform.select({
      ios: {
        shadowColor: Colors.text.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  emptyStateButton: {
    width: '80%',
  },
});
