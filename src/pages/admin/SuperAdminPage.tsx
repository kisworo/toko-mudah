import { useState, useEffect } from "react";
import { api, type User, type UserRole } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit2, 
  Trash2, 
  Power, 
  PowerOff,
  Shield,
  User as UserIcon,
  TrendingUp,
  Calendar,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

export function SuperAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    role: "user" as UserRole,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        api.getAllUsers(),
        api.getAdminStats(),
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal memuat data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateUser = async () => {
    try {
      await api.createUser(formData);
      toast({
        title: "Sukses",
        description: "User berhasil dibuat",
      });
      setIsCreateDialogOpen(false);
      setFormData({ username: "", email: "", password: "", full_name: "", role: "user" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal membuat user",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      await api.updateUser(selectedUser.id, formData);
      toast({
        title: "Sukses",
        description: "User berhasil diupdate",
      });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal mengupdate user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await api.deleteUser(selectedUser.id);
      toast({
        title: "Sukses",
        description: "User berhasil dihapus",
      });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus user",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await api.toggleUserActive(user.id, !user.is_active);
      toast({
        title: "Sukses",
        description: `User ${user.is_active ? "dinonaktifkan" : "diaktifkan"}`,
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal mengubah status user",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      full_name: user.full_name || "",
      role: user.role,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "superadmin":
        return <Badge className="bg-red-500"><Shield className="w-3 h-3 mr-1" /> SuperAdmin</Badge>;
      case "admin":
        return <Badge className="bg-blue-500"><UserIcon className="w-3 h-3 mr-1" /> Admin</Badge>;
      default:
        return <Badge variant="secondary"><UserIcon className="w-3 h-3 mr-1" /> User</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            SuperAdmin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola dan monitoring semua user dalam sistem
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" size="icon">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total User</CardDescription>
              <CardTitle className="text-3xl">{stats.totalUsers}</CardTitle>
            </CardHeader>
            <CardContent>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>User Aktif</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.activeUsers}</CardTitle>
            </CardHeader>
            <CardContent>
              <Power className="w-4 h-4 text-green-600" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>User Nonaktif</CardDescription>
              <CardTitle className="text-3xl text-red-600">{stats.inactiveUsers}</CardTitle>
            </CardHeader>
            <CardContent>
              <PowerOff className="w-4 h-4 text-red-600" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>User Baru Hari Ini</CardDescription>
              <CardTitle className="text-3xl">{stats.newUsersToday}</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>User Baru Minggu Ini</CardDescription>
              <CardTitle className="text-3xl">{stats.newUsersThisWeek}</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>User Baru Bulan Ini</CardDescription>
              <CardTitle className="text-3xl">{stats.newUsersThisMonth}</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar User</CardTitle>
              <CardDescription>Kelola semua user dalam sistem</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Tambah User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah User Baru</DialogTitle>
                  <DialogDescription>
                    Buat user baru dalam sistem
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="johndoe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Minimal 6 karakter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nama Lengkap</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="superadmin">SuperAdmin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleCreateUser}>Simpan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal Daftar</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.full_name || user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {user.is_active ? (
                        <Badge variant="default" className="bg-green-500">Aktif</Badge>
                      ) : (
                        <Badge variant="secondary">Nonaktif</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.created_at && (
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(user.created_at), "dd MMM yyyy, HH:mm", { locale: id })}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(user)}
                          title={user.is_active ? "Nonaktifkan" : "Aktifkan"}
                        >
                          {user.is_active ? (
                            <PowerOff className="w-4 h-4 text-red-500" />
                          ) : (
                            <Power className="w-4 h-4 text-green-500" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(user)}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(user)}
                          title="Hapus"
                          disabled={user.role === "superadmin"}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Tidak ada user yang ditemukan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update informasi user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">
                Password (kosongkan jika tidak ingin mengubah)
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Biarkan kosong jika tidak diubah"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-full_name">Nama Lengkap</Label>
              <Input
                id="edit-full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">SuperAdmin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleUpdateUser}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus User</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4">
              <p className="font-medium">{selectedUser.full_name || selectedUser.username}</p>
              <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
