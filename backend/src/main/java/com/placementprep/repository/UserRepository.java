package com.placementprep.repository;

import com.placementprep.entity.Role;
import com.placementprep.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    /** Count users in a given role (e.g. how many registered students). */
    long countByRole(Role role);

    /** Most recently registered users of a role — powers the dashboard "recent students". */
    List<User> findTop5ByRoleOrderByCreatedAtDesc(Role role);

    /**
     * Paginated student search. When {@code q} is null/blank all users of the role
     * are returned; otherwise it matches (case-insensitively) on name OR email.
     */
    @Query("SELECT u FROM User u WHERE u.role = :role AND (" +
            ":q IS NULL OR :q = '' OR " +
            "LOWER(u.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<User> searchByRole(@Param("role") Role role, @Param("q") String q, Pageable pageable);
}
