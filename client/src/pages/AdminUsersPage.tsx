
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ArrowLeft, UserPlus, Search, Edit, Trash2, Shield, User } from 'lucide-react';
import { Link } from 'wouter';

export default function AdminUsersPage() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: isAuthenticated && (user as any)?.role === 'admin'
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: { id: string; role: string; status: string }) => {
      const response = await fetch(`/api/admin/users/${userData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: userData.role, status: userData.status })
      });
      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    }
  });

  if (!isAuthenticated || (user as any)?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Доступ запрещен</h1>
          <p className="text-muted-foreground">У вас нет прав доступа к этой странице</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users?.filter((u: any) => 
    u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleEditUser = (userData: any) => {
    setSelectedUser(userData);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (selectedUser) {
      updateUserMutation.mutate({
        id: selectedUser.id,
        role: selectedUser.role,
        status: selectedUser.status
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад к панели
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Управление пользователями</h1>
          </div>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Добавить пользователя
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по имени или email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все роли</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                  <SelectItem value="user">Пользователь</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активный</SelectItem>
                  <SelectItem value="inactive">Неактивный</SelectItem>
                  <SelectItem value="banned">Заблокирован</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Пользователи ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Загрузка...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата регистрации</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((userData: any) => (
                    <TableRow key={userData.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {userData.firstName} {userData.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">ID: {userData.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{userData.email}</TableCell>
                      <TableCell>
                        <Badge variant={userData.role === 'admin' ? 'destructive' : 'secondary'}>
                          {userData.role === 'admin' ? (
                            <>
                              <Shield className="w-3 h-3 mr-1" />
                              Администратор
                            </>
                          ) : (
                            <>
                              <User className="w-3 h-3 mr-1" />
                              Пользователь
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          userData.status === 'active' ? 'default' :
                          userData.status === 'inactive' ? 'secondary' : 'destructive'
                        }>
                          {userData.status === 'active' ? 'Активный' :
                           userData.status === 'inactive' ? 'Неактивный' : 'Заблокирован'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('ru-RU') : 'Неизвестно'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(userData)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
                                deleteUserMutation.mutate(userData.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактировать пользователя</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div>
                  <Label>Имя</Label>
                  <Input
                    value={`${selectedUser.firstName} ${selectedUser.lastName}`}
                    disabled
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={selectedUser.email} disabled />
                </div>
                <div>
                  <Label>Роль</Label>
                  <Select
                    value={selectedUser.role}
                    onValueChange={(value) => setSelectedUser({...selectedUser, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Пользователь</SelectItem>
                      <SelectItem value="admin">Администратор</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Статус</Label>
                  <Select
                    value={selectedUser.status || 'active'}
                    onValueChange={(value) => setSelectedUser({...selectedUser, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Активный</SelectItem>
                      <SelectItem value="inactive">Неактивный</SelectItem>
                      <SelectItem value="banned">Заблокирован</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button
                    onClick={handleUpdateUser}
                    disabled={updateUserMutation.isPending}
                  >
                    {updateUserMutation.isPending ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </div>
  );
}
