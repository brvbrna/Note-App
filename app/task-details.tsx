import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  TextInput,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

interface Task {
  task: string;
  category: string;
}

export default function TaskDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const rawIndex = params.index;
  const indexStr = Array.isArray(rawIndex) ? rawIndex[0] : rawIndex;
  const taskIndex = indexStr ? parseInt(indexStr, 10) : 0;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const storedTasks = await AsyncStorage.getItem('tasks');
      const parsedTasks: Task[] = storedTasks ? JSON.parse(storedTasks) : [];
      setTasks(parsedTasks);

      const storedSubtasks = await AsyncStorage.getItem(`subtasks-${taskIndex}`);
      const parsedSubtasks: Subtask[] = storedSubtasks ? JSON.parse(storedSubtasks) : [];
      setSubtasks(parsedSubtasks);
    };

    loadData();
  }, [taskIndex]);

  const toggleCheck = async (id: string) => {
    const updatedSubtasks = subtasks.map((subtask) =>
      subtask.id === id ? { ...subtask, completed: !subtask.completed } : subtask
    );
    setSubtasks(updatedSubtasks);
    await AsyncStorage.setItem(`subtasks-${taskIndex}`, JSON.stringify(updatedSubtasks));
  };

  const addSubtask = async () => {
    if (newSubtaskText.trim() === '') {
      Alert.alert('Please enter a subtask');
      return;
    }

    const newSubtask: Subtask = {
      id: Date.now().toString(),
      text: newSubtaskText,
      completed: false,
    };

    const updatedSubtasks = [...subtasks, newSubtask];
    setSubtasks(updatedSubtasks);
    setNewSubtaskText('');
    setModalVisible(false);
    await AsyncStorage.setItem(`subtasks-${taskIndex}`, JSON.stringify(updatedSubtasks));
  };

  if (!tasks[taskIndex]) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Task not found.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <AntDesign name="arrowleft" size={24} color="black" />
          <Text style={{ marginLeft: 5 }}>Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const task = tasks[taskIndex];

  // Helper function to get image by category name
  const getImageByCategory = (category: string) => {
    switch (category.toLowerCase()) {
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
      //   return require('../assets/images/default.png'); // optional default image
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Arrow */}
      <TouchableOpacity style={styles.backArrow} onPress={() => router.back()}>
        <AntDesign name="arrowleft" size={24} color="black" />
      </TouchableOpacity>

      {/* Task Header */}
      <View style={styles.header}>
        <View style={styles.taskHeaderContent}>
          <Image source={getImageByCategory(task.category)} style={styles.taskImage} />
          <View style={{ marginLeft: 15 }}>
            <Text style={styles.taskNumber}>Task #{taskIndex + 1}</Text>
            <Text style={styles.category}>{task.category}</Text>
          </View>
        </View>
      </View>

      {/* Task Text */}
      <Text style={styles.taskTitle}>{task.task}</Text>

      {/* Subtasks List */}
      <FlatList
        data={subtasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.subtaskItem}
            onPress={() => toggleCheck(item.id)}
          >
            <AntDesign
              name={item.completed ? 'checkcircle' : 'checkcircleo'}
              size={24}
              color={item.completed ? '#007BFF' : '#ccc'}
            />
            <Text
              style={[
                styles.subtaskText,
                item.completed && { textDecorationLine: 'line-through', color: '#999' },
              ]}
            >
              {item.text}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptySubtaskText}>No subtasks yet.</Text>}
      />

      {/* Add Subtask Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Subtask</Text>
            <TextInput
              placeholder="Enter subtask"
              value={newSubtaskText}
              onChangeText={setNewSubtaskText}
              style={styles.modalInput}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#007BFF' }]}
                onPress={addSubtask}
              >
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                onPress={() => {
                  setModalVisible(false);
                  setNewSubtaskText('');
                }}
              >
                <Text style={[styles.modalButtonText, { color: '#333' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    padding: 20,
  },
  backArrow: {
    margin: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 30,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  taskNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  category: {
    fontSize: 16,
    color: '#666',
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 30,
    marginRight: 30,
    marginBottom: 20,
    color: '#333',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 30,
    marginRight: 30,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 1,
  },
  subtaskText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  emptySubtaskText: {
    marginLeft: 30,
    fontSize: 14,
    fontStyle: 'italic',
    color: '#999',
    marginTop: 10,
  },
  addButton: {
    backgroundColor: '#000000',
    borderRadius: 50,
    padding: 15,
    alignItems: 'center',
    position: 'absolute',
    bottom: 30,
    right: 30,
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 50,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    marginLeft: 20,
  },
});
