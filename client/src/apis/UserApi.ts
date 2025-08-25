import type { UserResponseDto, CreateUserDto, UpdateUserDto, LoginUserDto } from "@habit-tracker/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import ky, { HTTPError } from 'ky';

const KY_FETCH_RETRY_NUM = 0;
const REACT_QUERY_RETRY_NUM = 0;

// prefixUrl replaced by Vite proxy in dev to avoid CORS issues
const api = ky.create({
  prefixUrl: '/api',
  credentials: 'include',
  retry: KY_FETCH_RETRY_NUM,
});

/**
 * /users
 */

export async function fetchUser(): Promise<UserResponseDto | null> {
  try {
    return await api.get('users/me').json();
  } catch (err: any) {
    if (err.response?.status === 401) {
      return null;
    }
    throw err;
  }
}

export function useUser() {
  return useQuery<UserResponseDto | null, HTTPError>({
    queryKey: ['user'],
    queryFn: () => fetchUser(),
    retry: REACT_QUERY_RETRY_NUM,
  });
}

async function postCreateUser(newUser: CreateUserDto): Promise<UserResponseDto> {
  return api.post('users', { json: newUser }).json();
}

export function useCreateUserMutation() {
  return useMutation({
    mutationFn: (newUser: CreateUserDto) => { return postCreateUser(newUser) },
  })
}

async function patchUpdateUser(updateUser: UpdateUserDto): Promise<UserResponseDto> {
  return api.patch(`users/me`, { json: updateUser }).json();
}

export function useUpdateUserMutation() {
  return useMutation({
    mutationFn: ({ update }: { update: UpdateUserDto }) => { return patchUpdateUser(update) },
  })
}

async function deleteUser(): Promise<UserResponseDto> {
  return api.delete(`users/me`).json();
}

export function useDeleteUserMutation() {
  return useMutation({
    mutationFn: () => { return deleteUser() },
  })
}

async function postLoginUser(user: LoginUserDto): Promise<UserResponseDto> {
  return api.post('auth/login', { json: user }).json();
}

export function useLoginUserMutation() {
  return useMutation({
    mutationFn: (user: LoginUserDto) => { return postLoginUser(user) },
  })
}

async function postLogoutUser() {
  return api.post('auth/logout').json();
}

export function useLogoutUserMutation() {
  return useMutation({
    mutationFn: () => { return postLogoutUser() },
  })
}