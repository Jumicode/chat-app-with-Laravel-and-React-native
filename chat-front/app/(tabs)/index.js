import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { io } from "socket.io-client";

const App = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState("");

  useEffect(() => {
    // Conectar con el servidor Socket.io
    const newSocket = io("http://127.0.0.1:3000");
    setSocket(newSocket);

    // Escuchar los mensajes entrantes
    newSocket.on("sendChatToClient", (message) => {
      setMessages((prevMessages) => [...prevMessages, { text: message }]);
    });

    // Escuchar las actualizaciones de escritura
    newSocket.on("updateTyping", (data) => {
      setTyping(data ? `Escribiendo: ${data}` : "");
    });

    return () => newSocket.disconnect();
  }, []);

  // Manejar el envío de mensajes
  const sendMessage = () => {
    if (input.trim()) {
      socket.emit("sendChatToServer", input);
      setMessages((prevMessages) => [...prevMessages, { text: input }]);
      setInput("");
    }
  };

  // Manejar el evento de escritura
  const handleTyping = (text) => {
    setInput(text);
    socket.emit("typing", text);
  };

  return (
    <View style={styles.container}>
      {/* Lista de mensajes */}
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <Text style={styles.message}>{item.text}</Text>
        )}
        keyExtractor={(item, index) => index.toString()}
      />

      {/* Indicador de escritura */}
      {typing ? <Text style={styles.typing}>{typing}</Text> : null}

      {/* Entrada de texto */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={handleTyping}
          placeholder="Escribe un mensaje..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  message: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
  },
  typing: {
    fontStyle: "italic",
    color: "gray",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "lightgray",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#fff",
  },
  sendButton: {
    marginLeft: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default App;
