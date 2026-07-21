/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, MessageSquare, AlertCircle } from 'lucide-react';
import { Message, Listing, User as UserType } from '../../../types';
import { sendMessage } from '../../../firebase/firebase';
import { MessageService } from '../../../firebase/firestore';

interface MessagingDrawerProps {
  listing: Listing;
  currentUser: UserType;
  seller: UserType | undefined;
  onClose: () => void;
  language: 'en' | 'ar';
}

export default function MessagingDrawer({ listing, currentUser, seller, onClose, language }: MessagingDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const threadId = [currentUser.id, seller?.id || ''].sort().join('-');

  useEffect(() => {
    // Establish real-time Firestore listener for messages in this thread
    const unsubscribe = MessageService.subscribeMessages(threadId, (updatedMsgs) => {
      setMessages(updatedMsgs);
    });
    return () => unsubscribe();
  }, [threadId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !seller) return;

    sendMessage(currentUser.id, seller.id, inputText.trim());
    setInputText('');

    // Mock seller auto-reply after 2.5 seconds to make the chat feel incredibly interactive
    setTimeout(() => {
      const replyText = language === 'ar'
        ? `مرحباً! شكراً لاهتمامك بـ "${listing.title}". لقد تلقيت رسالتك وسأتصل بك قريباً لتنسيق الفحص.`
        : `Hello! Thanks for your interest in "${listing.title}". I received your message and will get back to you shortly to arrange a viewing!`;
      
      sendMessage(seller.id, currentUser.id, replyText);
    }, 2500);
  };

  return (
    <div id="messaging_drawer_overlay" className="fixed inset-0 bg-black/45 backdrop-blur-xs flex justify-end z-50 animate-fadeIn">
      <div id="messaging_drawer_content" className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-slideLeft">
        
        {/* Drawer Header */}
        <div className={`p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
              {seller?.name ? seller.name.charAt(0) : <User className="w-5 h-5" />}
            </div>
            <div className={language === 'ar' ? 'text-right' : 'text-left'}>
              <h4 className="text-sm font-bold text-gray-900 font-sans">{seller?.name || 'Seller'}</h4>
              <span className="text-[10px] text-green-500 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                {language === 'ar' ? 'نشط الآن' : 'Online'}
              </span>
            </div>
          </div>
          <button
            id="close_messaging_drawer"
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Listing Mini Card Context Info */}
        <div className={`p-3 bg-blue-50/50 border-b border-blue-50 flex gap-3 items-center ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
          <img
            src={listing.images[0]}
            alt={listing.title}
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          />
          <div className={`flex-1 min-w-0 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider font-mono">
              {language === 'ar' ? 'تستفسر عن:' : 'Inquiry Context:'}
            </span>
            <h5 className="text-xs font-bold text-gray-800 truncate">{listing.title}</h5>
            <span className="text-xs font-mono font-bold text-gray-900">${listing.price.toLocaleString()}</span>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div id="chat_messages_body" className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
              <MessageSquare className="w-8 h-8 text-gray-300" />
              <p className="text-xs">{language === 'ar' ? 'لا توجد رسائل سابقة. أرسل رسالة للبدء.' : 'No messages yet. Send a hello!'}</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-xs ${
                    isMine 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                  }`}>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <span className="text-[9px] text-gray-400 mt-1 font-mono">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Dynamic Security Advice */}
        <div className="p-2.5 bg-yellow-50 text-[10px] text-yellow-800 border-t border-yellow-100 flex items-start gap-1.5 font-medium">
          <AlertCircle className="w-3.5 h-3.5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {language === 'ar' 
              ? 'تنبيه الأمان: لا تقم بتحويل الأموال مسبقاً قبل الفحص الفعلي للمنتج أو العقار.' 
              : 'Safety Advice: Never wire deposits or transfer money upfront before inspecting items or properties physically.'}
          </p>
        </div>

        {/* Chat Input Footer */}
        <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white flex gap-2">
          <input
            id="chat_text_input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={language === 'ar' ? "اكتب رسالة..." : "Type a message..."}
            className={`flex-1 bg-gray-50 border border-gray-200 rounded-xl ${language === 'ar' ? 'text-right pr-4' : 'pl-4'} py-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
          <button
            id="send_message_btn"
            type="submit"
            disabled={!inputText.trim()}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-sm flex items-center justify-center active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
