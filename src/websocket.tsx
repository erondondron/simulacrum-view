import { useState, useEffect } from 'react';

function WebsocketPage() {
    const [messages, setMessages] = useState<string[]>([]); // ���� ��������� ��� string[] ��� messages

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8000/ws');

        ws.onopen = () => {
            console.log('WebSocket Client Connected');
        };

        ws.onmessage = (event) => {
            console.log('Received message:', event.data);
            setMessages(prevMessages => [...prevMessages, event.data]);
        };

        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket Connection Closed');
        };

        // ����� ��������� ��������������, ��������� ���������� � WebSocket
        return () => {
            ws.close();
        };
    }, []); // ������ ������ ������������, ����� useEffect ���������� ������ ���� ���

    return (
        <div>
            <h2>Websocket</h2>
            <div>
                {messages.map((message, index) => (
                    <p key={index}>{message}</p>
                ))}
            </div>
        </div>
    );
}

export default WebsocketPage;
