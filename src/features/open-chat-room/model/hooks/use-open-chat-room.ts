import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { useChatContacts, useOpenChatRoomAction, type ChatContact } from "@entities/chat";
import { toast } from "@shared/ui/toasts";

/**
 * 대화 상대를 골라 방을 연다.
 *
 * 서버가 멱등이라 이미 대화하던 상대를 골라도 새 방이 생기지 않는다 — 그래서
 * "새 대화"와 "기존 대화 이어가기"를 화면에서 가를 필요가 없다.
 */
export const useOpenChatRoom = () => {
  const [isOpen, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const navigate = useNavigate();
  const { data: contacts, isLoading, error } = useChatContacts();
  const { openRoom, isLoading: isOpening } = useOpenChatRoomAction();

  const visibleContacts: ChatContact[] = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return contacts;

    return contacts.filter((contact) =>
      [contact.name, contact.department].some((field) =>
        field?.toLowerCase().includes(keyword),
      ),
    );
  }, [contacts, query]);

  const open = () => {
    setQuery("");
    setOpen(true);
  };

  const handleSelect = async (contact: ChatContact) => {
    try {
      const room = await openRoom(contact.userId);
      setOpen(false);
      navigate(`/chat/${room.roomId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "대화방을 열지 못했습니다.");
    }
  };

  return {
    isOpen,
    setOpen,
    open,
    query,
    setQuery,
    contacts: visibleContacts,
    isEmpty: contacts.length === 0,
    isLoading,
    isOpening,
    error,
    handleSelect,
  };
};
