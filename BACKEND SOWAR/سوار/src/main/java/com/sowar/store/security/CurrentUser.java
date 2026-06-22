package com.sowar.store.security;

import java.util.Objects;

/**
 * Simple immutable holder for authenticated principal information.
 *
 * Was previously a Java record; replaced with a plain class to ensure
 * compatibility with older toolchains that may not support records.
 */
public final class CurrentUser {

	private final Long id;
	private final String email;
	private final String role;

	public CurrentUser(Long id, String email, String role) {
		this.id = id;
		this.email = email;
		this.role = role;
	}

	// keep the concise accessor names used across the codebase (id(), email(), role())
	public Long id() {
		return id;
	}

	public String email() {
		return email;
	}

	public String role() {
		return role;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;
		CurrentUser that = (CurrentUser) o;
		return Objects.equals(id, that.id) && Objects.equals(email, that.email) && Objects.equals(role, that.role);
	}

	@Override
	public int hashCode() {
		return Objects.hash(id, email, role);
	}

	@Override
	public String toString() {
		return "CurrentUser{" + "id=" + id + ", email='" + email + '\'' + ", role='" + role + '\'' + '}';
	}
}
