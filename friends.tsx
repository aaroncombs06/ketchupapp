import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Platform } from 'react-native';
import { Search, Plus } from 'lucide-react-native';
import { FriendCard } from '@/components/ui/FriendCard';
import { Button } from '@/components/ui/Button';
import Colors from '@/constants/colors';
import { useUserStore } from '@/store/userStore';
import { Friend } from '@/types';

export default function FriendsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  const user = useUserStore(state => state.user);
  const updateFriendTags = useUserStore(state => state.updateFriendTags);
  
  const handleTagPress = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };
  
  const filteredFriends = user?.friends.filter(friend => {
    const matchesSearch = !searchQuery || 
      friend.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = !selectedTag || friend.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  }) || [];
  
  const allTags = user?.friends.reduce((tags: string[], friend) => {
    friend.tags.forEach(tag => {
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    });
    return tags;
  }, []) || [];
  
  const handleFriendPress = (friend: Friend) => {
    // In a real app, this would navigate to the friend's profile
    console.log('Friend pressed:', friend.name);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search friends..."
          placeholderTextColor={Colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      {allTags.length > 0 && (
        <View style={styles.tagsContainer}>
          <Text style={styles.tagsTitle}>Filter by tag:</Text>
          <FlatList
            data={allTags}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Button
                title={item}
                variant={selectedTag === item ? 'secondary' : 'outline'}
                size="small"
                onPress={() => handleTagPress(item)}
                style={styles.tagButton}
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}
      
      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FriendCard
            friend={item}
            onPress={handleFriendPress}
            onTagPress={handleTagPress}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery || selectedTag
                ? 'No friends match your search'
                : 'No friends yet. Add some friends to get started!'}
            </Text>
            {!searchQuery && !selectedTag && (
              <Button
                title="Add Friends"
                onPress={() => {}}
                style={styles.addButton}
                variant="gradient"
              />
            )}
          </View>
        )}
      />
      
      <View style={styles.fabContainer}>
        <Button
          title="Add Friend"
          onPress={() => {}}
          style={styles.fab}
          textStyle={styles.fabText}
          variant="gradient"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ui.background,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.ui.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.neutral.ecru,
    ...Platform.select({
      ios: {
        shadowColor: Colors.text.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text.primary,
  },
  tagsContainer: {
    marginBottom: 16,
  },
  tagsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  tagButton: {
    marginRight: 8,
  },
  emptyContainer: {
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
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  addButton: {
    width: '50%',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    ...Platform.select({
      ios: {
        shadowColor: Colors.text.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  fab: {
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabText: {
    marginLeft: 8,
  },
});
