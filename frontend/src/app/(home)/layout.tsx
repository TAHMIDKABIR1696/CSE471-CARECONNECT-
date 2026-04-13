import Footer from "@/modules/home/components/footer";
import Navbar from "@/modules/home/components/navbar";
import { Toaster } from "react-hot-toast";
import FloatingChatbot from "@/components/chatbot/floating-chatbot";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      <Toaster position="top-center" />
      {children}
      <Footer />
      <FloatingChatbot />
    </div>
  );
}
