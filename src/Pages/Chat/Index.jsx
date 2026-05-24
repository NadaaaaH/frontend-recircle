import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/Layouts/MainLayout";
import { Send, Search, CheckCircle2, ChevronLeft, Tag } from "lucide-react";
import api from "@/lib/axios";

export default function ChatIndex() {
    const { user: currentUser, setUnreadChatCount } = useAuth();
    
    const [searchParams] = useSearchParams();
    const initial_selected_user_id = parseInt(searchParams.get('user_id')) || null;
    const initial_user_name = searchParams.get('user_name') || null;
    const initial_product_id = parseInt(searchParams.get('product_id')) || null;
    const initial_product_name = searchParams.get('product_name') || null;
    const initial_product_price = parseInt(searchParams.get('product_price')) || 0;
    const initial_product_img = searchParams.get('product_img') || null;

    const [contacts, setContacts] = useState([]);
    const [isLoadingContacts, setIsLoadingContacts] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const selectedUserRef = useRef(null);

    // Keep ref updated for non-reactive closure use in Echo listeners
    useEffect(() => {
        selectedUserRef.current = selectedUser;
    }, [selectedUser]);

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [activeProduct, setActiveProduct] = useState(null);
    const [isSending, setIsSending] = useState(false);

    const messagesEndRef = useRef(null);

    // Real-time listener Setup via Echo
    useEffect(() => {
        if (!currentUser || !window.Echo) return;

        const channelName = `chat.${currentUser.id}`;
        const channel = window.Echo.private(channelName);

        channel.listen("MessageSent", (event) => {
            const incomingMsgRaw = event.message;
            
            // Map the API data structure to match our frontend state
            const incomingMsg = {
                id: incomingMsgRaw.id,
                sender_id: incomingMsgRaw.sender_id || incomingMsgRaw.senderId,
                receiver_id: incomingMsgRaw.receiver_id || incomingMsgRaw.receiverId,
                message: incomingMsgRaw.message,
                time: new Date(incomingMsgRaw.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                is_read: incomingMsgRaw.is_read || false,
                product: incomingMsgRaw.product
            };

            // 1. Update current chat messages IF the incoming message belongs to current chat room
            if (selectedUserRef.current && selectedUserRef.current.id === incomingMsg.sender_id) {
                setMessages((prev) => [...prev, incomingMsg]);
                // Auto-read the message via API since we are viewing it
                api.get(`/chat/${incomingMsg.sender_id}`).catch(() => {});
            }

            // 2. Update global contact sidebar list (bring user to top & update last message / unread)
            setContacts((prevContacts) => {
                let updatedContacts = [...prevContacts];
                const existingIndex = updatedContacts.findIndex(
                    (c) => c.id === incomingMsg.sender_id
                );

                const isCurrentlyOpen = selectedUserRef.current && selectedUserRef.current.id === incomingMsg.sender_id;

                if (existingIndex > -1) {
                    const contact = { ...updatedContacts[existingIndex] };
                    contact.last_message = incomingMsg.message;
                    contact.created_at = "Baru saja";
                    
                    if (!isCurrentlyOpen) {
                        contact.unread_count = (contact.unread_count || 0) + 1;
                    }
                    
                    updatedContacts.splice(existingIndex, 1);
                    updatedContacts.unshift(contact);
                } else {
                    // Brand new conversation starter
                    const senderName = incomingMsgRaw.sender?.name || "Pengguna";
                    updatedContacts.unshift({
                        id: incomingMsg.sender_id,
                        name: senderName,
                        avatar: incomingMsgRaw.sender?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=f3f4f6&color=43552c`,
                        last_message: incomingMsg.message,
                        created_at: "Baru saja",
                        unread_count: isCurrentlyOpen ? 0 : 1,
                    });
                }
                return updatedContacts;
            });
        });

        return () => {
            channel.stopListening("MessageSent");
        };
    }, [currentUser]);

    // Initial Load Logic
    useEffect(() => {
        document.title = "Pesan | ReCircle";
        
        // Load contacts list
        api.get('/chat')
            .then(res => {
                const fetchedContacts = res.data?.data || [];
                setContacts(fetchedContacts);
                
                if (initial_selected_user_id) {
                    const existingUser = fetchedContacts.find(c => c.id === initial_selected_user_id);
                    if (existingUser) {
                        openChat(existingUser);
                    } else {
                        // Handshake via URL parameter
                        const newTempContact = { 
                            id: initial_selected_user_id, 
                            name: initial_user_name || "Pengguna",
                            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(initial_user_name || 'Pengguna')}&background=f3f4f6&color=43552c`,
                            unread_count: 0
                        };
                        openChat(newTempContact);
                    }
                }
            })
            .catch(err => {
                console.error("Error loading chat contacts:", err);
                // Fallback initialization
                if (initial_selected_user_id) {
                    openChat({ 
                        id: initial_selected_user_id, 
                        name: initial_user_name || "Pengguna",
                        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(initial_user_name || 'Pengguna')}&background=f3f4f6&color=43552c`,
                        unread_count: 0
                    });
                }
            })
            .finally(() => setIsLoadingContacts(false));
    }, [initial_selected_user_id]);

    // Auto-scroll behavior
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const openChat = async (user) => {
        setSelectedUser(user);

        // Zero out unread count in UI locally
        setContacts((prev) => {
            const targetContact = prev.find(c => c.id === user.id);
            if (targetContact && targetContact.unread_count > 0 && setUnreadChatCount) {
                setUnreadChatCount(count => Math.max(0, count - targetContact.unread_count));
            }
            return prev.map((c) => (c.id === user.id ? { ...c, unread_count: 0 } : c));
        });

        // Inject context from URL metadata
        if (initial_product_id) {
            setActiveProduct({
                id: initial_product_id,
                name: initial_product_name || "Produk",
                price: initial_product_price || 0,
                img: initial_product_img || "https://placehold.co/400x400?text=Barang",
            });
        }

        // Fetch messages from Database (MongoDB managed via Laravel API)
        api.get(`/chat/${targetUser.id}`)
            .then(res => {
                const rawMessages = res.data?.data || [];
                const formattedMessages = rawMessages.map(msg => ({
                    id: msg.id,
                    sender_id: msg.senderId, // camelCase matching Laravel Resource
                    receiver_id: msg.receiverId,
                    message: msg.message,
                    time: msg.time,
                    is_read: msg.isRead,
                    product: msg.product
                }));
                
                setMessages(formattedMessages);
                
                // If user context was missing product details, peek last message's product reference
                if (!initial_product_id && formattedMessages.length > 0) {
                    const lastProductRef = [...formattedMessages].reverse().find(m => m.product);
                    if (lastProductRef) {
                        setActiveProduct({
                            id: lastProductRef.product.id,
                            name: lastProductRef.product.name,
                            price: lastProductRef.product.price,
                            img: lastProductRef.product.image,
                        });
                    } else {
                        setActiveProduct(null);
                    }
                }
            })
            .catch(err => {
                console.error("Chat retrieval failed:", err);
                setMessages([]);
            });
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        const payloadMsg = newMessage;
        setNewMessage("");
        setIsSending(true);

        api.post('/chat', {
            receiver_id: selectedUser.id,
            message: payloadMsg,
            product_id: activeProduct?.id
        }).then(res => {
            const msgData = res.data?.data;
            if (!msgData) return;

            const outgoingMsg = {
                id: msgData.id,
                sender_id: msgData.senderId,
                receiver_id: msgData.receiverId,
                message: msgData.message,
                time: msgData.time,
                is_read: msgData.isRead,
                product: msgData.product
            };

            setMessages((prev) => [...prev, outgoingMsg]);
            
            // Push my new message context to the very top of contact list
            setContacts((prev) => {
                let updated = [...prev];
                const index = updated.findIndex((c) => c.id === selectedUser.id);
                if (index > -1) {
                    const c = { ...updated[index] };
                    c.last_message = payloadMsg;
                    c.created_at = "Baru saja";
                    updated.splice(index, 1);
                    updated.unshift(c);
                } else {
                    updated.unshift({
                        id: selectedUser.id,
                        name: selectedUser.name,
                        avatar: selectedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=f3f4f6&color=43552c`,
                        last_message: payloadMsg,
                        created_at: "Baru saja",
                        unread_count: 0,
                    });
                }
                return updated;
            });
        }).catch(err => {
            console.error("API request failed:", err);
        }).finally(() => {
            setIsSending(false);
        });
    };

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return (
        <MainLayout>
            <div className="bg-[#f7f9f7] min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto h-[80vh] flex bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-gray-100">
                    {/* Sidebar Kontak */}
                    <div
                        className={`w-full md:w-1/3 flex-shrink-0 border-r border-gray-100 flex flex-col ${selectedUser ? "hidden md:flex" : "flex"}`}
                    >
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-2xl font-black text-gray-900 mb-4">
                                Pesan
                            </h2>
                            <div className="relative">
                                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari chat..."
                                    className="w-full bg-[#f7f9f7] border-none rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#43552c]/20"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {isLoadingContacts ? (
                                <div className="p-8 flex flex-col items-center justify-center">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#43552c]/20 border-t-[#43552c] mb-3"></div>
                                    <span className="text-gray-400 text-xs">Memuat obrolan...</span>
                                </div>
                            ) : contacts.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm">
                                    Belum ada percakapan.
                                </div>
                            ) : (
                                contacts.map((contact) => (
                                    <button
                                        key={contact.id}
                                        onClick={() => openChat(contact)}
                                        className={`w-full text-left p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors border-b border-gray-50 ${selectedUser?.id === contact.id ? "bg-[#43552c]/5" : ""}`}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <img
                                                src={contact.avatar}
                                                alt=""
                                                className="w-12 h-12 rounded-full object-cover border border-gray-100"
                                            />
                                            {contact.unread_count > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-[#d4a373] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                                    {contact.unread_count}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h4 className="font-bold text-gray-900 text-sm truncate">
                                                    {contact.name}
                                                </h4>
                                                <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">
                                                    {contact.created_at}
                                                </span>
                                            </div>
                                            <p
                                                className={`text-sm truncate ${contact.unread_count > 0 ? "text-gray-900 font-bold" : "text-gray-500"}`}
                                            >
                                                {contact.last_message}
                                            </p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div
                        className={`flex-1 flex flex-col bg-[#f7f9f7]/50 ${!selectedUser ? "hidden md:flex" : "flex"}`}
                    >
                        {selectedUser ? (
                            <>
                                {/* Header Chat */}
                                <div className="h-20 px-6 border-b border-gray-100 bg-white flex items-center justify-between shadow-sm z-10">
                                    <div className="flex items-center gap-4">
                                        <button
                                            className="md:hidden text-gray-400 hover:text-gray-900"
                                            onClick={() => setSelectedUser(null)}
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${selectedUser.name}&background=f3f4f6&color=43552c`}
                                                alt=""
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                            <div>
                                                <h3 className="font-bold text-gray-900">
                                                    {selectedUser.name}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Context Panel */}
                                {activeProduct && (
                                    <div className="bg-white mx-6 mt-6 p-3 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.03)] flex items-center gap-4 border border-gray-100">
                                        <img
                                            src={activeProduct.img}
                                            alt=""
                                            className="w-12 h-12 rounded-xl object-cover bg-gray-50"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                                                Berdiskusi Tentang
                                            </p>
                                            <h4 className="text-sm font-bold text-gray-900 truncate">
                                                {activeProduct.name}
                                            </h4>
                                            <p className="text-xs font-bold text-[#43552c]">
                                                Rp {parseInt(activeProduct.price || 0).toLocaleString("id-ID")}
                                            </p>
                                        </div>
                                        <Link
                                            to={`/products/${activeProduct.id}`}
                                            className="px-4 py-2 bg-[#f7f9f7] text-[#43552c] rounded-xl text-xs font-bold hover:bg-[#43552c]/10 transition-colors whitespace-nowrap border border-gray-100"
                                        >
                                            Lihat
                                        </Link>
                                    </div>
                                )}

                                {/* Message Logs */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    {messages.map((msg, idx) => {
                                        const isMine = msg.sender_id === currentUser.id;
                                        return (
                                            <div
                                                key={msg.id || idx}
                                                className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                                            >
                                                <div
                                                    className={`px-5 py-3 max-w-[75%] rounded-2xl ${
                                                        isMine
                                                            ? "bg-[#43552c] text-white rounded-br-sm shadow-md shadow-[#43552c]/20"
                                                            : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm"
                                                    }`}
                                                >
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                        {msg.message}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 mt-1.5 px-1 text-[10px] font-bold text-gray-400">
                                                    <span>{msg.time}</span>
                                                    {isMine && (
                                                        <CheckCircle2
                                                            className={`w-3 h-3 ${msg.is_read ? "text-[#43552c]" : "text-gray-300"}`}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Footer Input */}
                                <div className="p-6 bg-white border-t border-gray-100">
                                    <form
                                        onSubmit={sendMessage}
                                        className="flex items-end gap-3"
                                    >
                                        <div className="flex-1 bg-[#f7f9f7] rounded-3xl border border-gray-200 focus-within:border-[#43552c] focus-within:ring-2 focus-within:ring-[#43552c]/20 transition-all p-1 flex items-center">
                                            <textarea
                                                rows="1"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && !e.shiftKey) {
                                                        e.preventDefault();
                                                        sendMessage(e);
                                                    }
                                                }}
                                                placeholder="Ketik pesan disini..."
                                                className="w-full bg-transparent border-none rounded-3xl px-4 py-2.5 text-sm focus:ring-0 resize-none max-h-32"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim() || isSending}
                                            className="w-12 h-12 flex-shrink-0 bg-[#43552c] text-white rounded-full flex items-center justify-center hover:bg-[#364423] shadow-md shadow-[#43552c]/20 transition-all disabled:opacity-50"
                                        >
                                            <Send className="w-5 h-5 ml-1" />
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <div className="w-20 h-20 bg-[#43552c]/5 rounded-full flex items-center justify-center mb-6">
                                    <Send className="w-8 h-8 text-[#43552c] opacity-50" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">
                                    Pilih Percakapan
                                </h3>
                                <p className="text-gray-500 max-w-sm">
                                    Diskusi soal produk lebih mudah melalui
                                    fitur obrolan real-time ini.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
