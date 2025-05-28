import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Task {
  task: string;
  category: string;
}

export default function AddTaskScreen() {
  const router = useRouter();
  const [task, setTask] = useState('');
  const [category, setCategory] = useState('Health');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const saveTask = async () => {
    if (task.trim() === '') {
      setModalMessage('Please enter a task.');
      setModalVisible(true);
      return;
    }

    try {
      const newTask: Task = { task, category };
      const storedTasks = await AsyncStorage.getItem('tasks');
      const tasksArray: Task[] = storedTasks ? JSON.parse(storedTasks) : [];

      tasksArray.push(newTask);
      await AsyncStorage.setItem('tasks', JSON.stringify(tasksArray));

      setModalMessage('Task added successfully!');
      setModalVisible(true);

      setTimeout(() => {
        setModalVisible(false);
        router.replace('/'); // Go back to index
      }, 1500);
    } catch (error) {
      setModalMessage('Could not save task.');
      setModalVisible(true);
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* KeyboardAvoidingView handles the keyboard behavior */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} // Adjust as needed
      >
        {/* ScrollView allows scrolling when keyboard is open */}
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.innerContainer}>
            {/* Cancel X Button */}
            <TouchableOpacity style={styles.cancelX} onPress={() => router.back()}>
              <AntDesign name="close" size={24} color="black" />
            </TouchableOpacity>

            {/* Form */}
            <Text style={styles.label}>Task</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your task"
              value={task}
              onChangeText={setTask}
              returnKeyType="done"
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.dropdown}>
              <Picker
                selectedValue={category}
                onValueChange={(itemValue) => setCategory(itemValue)}
              >
                <Picker.Item label="Health" value="Health" />
                <Picker.Item label="Movies" value="Movies" />
                <Picker.Item label="Travels" value="Travels" />
                <Picker.Item label="Bills" value="Bills" />
                <Picker.Item label="Study" value="Study" />
              </Picker>
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.addButton} onPress={saveTask}>
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal */}
<Modal animationType="fade" transparent={true} visible={modalVisible}>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      {/* Close X Button */}
      <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
        <AntDesign name="close" size={20} color="black" />
      </TouchableOpacity>

      <Text style={styles.modalText}>{modalMessage}</Text>
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
  },
  modalCloseButton: {
  position: 'absolute',
  top: 5,
  right: 5,
  padding: 5,
  zIndex: 1,
},

  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',  // center vertically when possible
    padding: 20,
  },
  innerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    position: 'relative',
    // Align all items center horizontally
    alignItems: 'center',
  },
  cancelX: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  label: {
    alignSelf: 'flex-start', // keep label aligned left inside centered container
    marginTop: 20,
    marginBottom: 5,
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fafafa',
  },
  dropdown: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#fafafa',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  addButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#999',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 50,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
