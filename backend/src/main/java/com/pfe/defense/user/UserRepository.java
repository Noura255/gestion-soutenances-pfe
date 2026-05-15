package com.pfe.defense.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmail(String email);
    boolean existsByEmailIgnoreCase(String email);
    long countByRole(Role role);
    long countByEnabledTrue();
    long countByEnabledFalse();

    @Query("""
            select u from User u
            where (:search is null
                or lower(u.firstName) like lower(concat('%', :search, '%'))
                or lower(u.lastName) like lower(concat('%', :search, '%'))
                or lower(u.email) like lower(concat('%', :search, '%')))
              and (:role is null or u.role = :role)
              and (:department is null or lower(u.department) = lower(:department))
              and (:enabled is null or u.enabled = :enabled)
            order by u.createdAt desc
            """)
    List<User> searchUsers(@Param("search") String search,
                           @Param("role") Role role,
                           @Param("department") String department,
                           @Param("enabled") Boolean enabled);
}
