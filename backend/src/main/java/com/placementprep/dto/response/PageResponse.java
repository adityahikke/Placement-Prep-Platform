package com.placementprep.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Stable, framework-agnostic pagination envelope returned by the admin APIs.
 * We deliberately avoid serializing Spring's {@code PageImpl} directly (its
 * JSON shape is unstable across versions and triggers a serialization warning).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;

    /** Wrap a Spring {@link Page}, mapping each element through {@code mapper}. */
    public static <E, T> PageResponse<T> from(Page<E> source, Function<E, T> mapper) {
        return PageResponse.<T>builder()
                .content(source.getContent().stream().map(mapper).collect(Collectors.toList()))
                .page(source.getNumber())
                .size(source.getSize())
                .totalElements(source.getTotalElements())
                .totalPages(source.getTotalPages())
                .first(source.isFirst())
                .last(source.isLast())
                .build();
    }
}
