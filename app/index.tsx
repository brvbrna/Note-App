// app/index.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Task {
  task: string;
  category: string;
}

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchTasks = async () => {
      const storedTasks = await AsyncStorage.getItem('tasks');
      const parsedTasks: Task[] = storedTasks ? JSON.parse(storedTasks) : [];
      setTasks(parsedTasks);
    };

    fetchTasks();
  }, []);

  const getCategoryImage = (category: string) => {
    const imageName = category.toLowerCase();
    switch (imageName) {
      case 'health':
        return require('../assets/images/health.png');
      case 'movies':
        return require('../assets/images/movies.png');
      case 'study':
        return require('../assets/images/study.png');
      case 'travels':
        return require('../assets/images/travels.png');
      case 'bills':
        return require('../assets/images/bills.png');
      // default:
      //   return require('../assets/images/default.png'); // optional fallback
    }
  };

const renderItem = ({ item, index }: { item: Task; index: number }) => (
  <View style={styles.taskItem}>
    <TouchableOpacity
      style={styles.taskContent}
      onPress={() =>
        router.push({ pathname: '/task-details', params: { index: index.toString() } })
      }
    >
      <Image source={getCategoryImage(item.category)} style={styles.taskImage} />
      <View>
        <Text style={styles.taskText}>{item.task}</Text>
        <Text style={styles.categoryText}>{item.category}</Text>
      </View>
    </TouchableOpacity>

    {/* Delete Button */}
    <TouchableOpacity style={styles.deleteButton} onPress={() => deleteTask(index)}>
      <AntDesign name="delete" size={22} color="red" />
    </TouchableOpacity>
  </View>
);

const deleteTask = async (indexToDelete: number) => {
  const updatedTasks = tasks.filter((_, index) => index !== indexToDelete);
  setTasks(updatedTasks);
  await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
};


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.slogan}>"Stay Organized, Stay Productive"</Text>
        <Image source={require('../assets/images/person.png')} style={styles.profileImage} />
      </View>

      <View style={styles.taskContainer}>
        {tasks.length === 0 ? (
          <Text style={styles.emptyText}>No tasks added yet.</Text>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
          />
        )}
      </View>

      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-task')}>
        <AntDesign name="plus" size={30} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    padding: 20,
    justifyContent: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  slogan: {
    fontSize: 18,
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginTop: 50,
    marginLeft: 10,
  },
  profileImage: {
    width: 80,
    marginTop: 50,
    margin: 10,
    height: 80,
    borderRadius: 40,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  taskContainer: {
    flex: 1,
    borderRadius: 12,
    padding: 20,
    elevation: 3,
  },
  taskItem: {
    flexDirection: 'row', // for task + delete side-by-side
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Shadow for Android
    elevation: 3,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // to take available space before delete
    gap: 10,
  },
  taskImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    resizeMode: 'contain',
  },
  taskText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    padding: 6,
    marginLeft: 10,
    backgroundColor: '#ffe5e5',
    borderRadius: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 20,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#000',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
});

