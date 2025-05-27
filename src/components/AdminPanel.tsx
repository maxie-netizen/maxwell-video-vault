
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function fetchProfiles() {
      setLoading(true);
      try {
        const { data } = await supabase.from("profiles").select("*");
        if (isMounted) setUsers(data || []);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchProfiles();
    return () => {
      isMounted = false;
    };
  }, [refresh]);

  const handleRemove = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user? This will remove all their saved data!"
      )
    )
      return;
    setLoading(true);
    await supabase.from("profiles").delete().eq("id", id);
    setRefresh((r) => r + 1);
    toast({
      title: "User removed",
    });
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newUsername || !newEmail || !newPassword) {
      toast({ title: "All fields required", variant: "destructive" });
      return;
    }
    setLoading(true);
    // create user in auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: newEmail,
      password: newPassword,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    // insert into profiles
    const userId = data.user?.id;
    if (userId) {
      await supabase.from("profiles").insert({
        id: userId,
        username: newUsername,
        role: "user",
      });
      setRefresh((r) => r + 1);
      setNewUsername("");
      setNewEmail("");
      setNewPassword("");
      toast({ title: "User added" });
    }
    setLoading(false);
  };

  return (
    <div className="bg-neutral-900 p-6 rounded-lg shadow-lg max-w-md mx-auto text-white mt-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Admin Panel</h2>
        <div className="space-y-1">
          <input
            type="text"
            placeholder="Username"
            className="px-3 py-1 rounded text-black w-full"
            value={newUsername}
            onChange={e => setNewUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="px-3 py-1 rounded text-black w-full"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="px-3 py-1 rounded text-black w-full"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <Button onClick={handleAdd} disabled={loading} className="w-full">Add User</Button>
        </div>
      </div>
      <h3 className="font-semibold mb-2 mt-6">Members</h3>
      <ul className="space-y-2">
        {loading ? (
          <li>Loading...</li>
        ) : (
          users.map((user) => (
            <li key={user.id} className="flex justify-between items-center text-white bg-neutral-800 px-2 py-1 rounded">
              <div>
                <span className="font-semibold">{user.username}</span>{" "}
                <span className="text-xs text-gray-400">{user.role}</span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemove(user.id)}
                className="ml-2 px-2 py-0.5"
              >
                Remove
              </Button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
