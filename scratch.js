const fs = require('fs');
let c = fs.readFileSync('src/app/modules/livechat/LiveChatPopup.tsx', 'utf8');

c = c.replace(/setConversations\([\s\S]*?}\s*\)\s*\)/, `try {
        const res = await api.getMessages(token, room.id)
        if (res.success && Array.isArray(res.data)) {
          setMessages(res.data.reverse())
        }
        await api.markAsRead(token, room.id)
        setRooms((prev) => prev.map((r) => (r.id === room.id ? { ...r, unreadCount: 0 } : r)))
      } catch (e) { console.error(e) } finally { setLoadingMessages(false) }
    },
    [token]
  )`);

fs.writeFileSync('src/app/modules/livechat/LiveChatPopup.tsx', c);
console.log("Done");
