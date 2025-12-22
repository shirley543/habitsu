export interface JwtPayload {
  email: string;
  username: string;
  sub: string | number;
}
