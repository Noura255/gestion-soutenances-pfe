package com.pfe.defense.administration.repository;

import com.pfe.defense.user.Role;
import com.pfe.defense.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository dédié au module administration pour les requêtes sur les utilisateurs.
 */
public interface AdminUserQueryRepository extends JpaRepository<User, Long> {

    List<User> findAllByRole(Role role);

    List<User> findAllByRoleIn(List<Role> roles);
}
