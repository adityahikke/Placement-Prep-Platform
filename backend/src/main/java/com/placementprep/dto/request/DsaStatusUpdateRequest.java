package com.placementprep.dto.request;

import com.placementprep.entity.DsaStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DsaStatusUpdateRequest {

    @NotNull
    private DsaStatus status;

    /**
     * SOLVED is "sticky": once a problem is Solved, the backend refuses to move it
     * back to a lower status unless this flag is explicitly set to {@code true}.
     * This stops an accidental click from wiping out hard-won progress. The UI only
     * sends {@code force=true} when the student deliberately confirms an undo.
     */
    private boolean force = false;
}
