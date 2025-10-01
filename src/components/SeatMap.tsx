import React from 'react';
import { Box, Typography, Chip, useTheme, useMediaQuery } from '@mui/material';
import { EventSeat, Remove } from '@mui/icons-material';

interface SeatData {
  id?: number;
  seatId: string;
  isAvailable: boolean;
  isSeat: boolean;
  floorIndex: number;
  rowIndex: number;
  columnIndex: number;
}

interface SeatMapProps {
  seats: SeatData[];
  onSeatClick?: (seat: SeatData) => void;
  selectedSeats?: string[];
  maxSeats?: number;
  showLegend?: boolean;
  compact?: boolean;
  disabled?: boolean;
  floorDisplay?: 'all' | 'toggle';
  initialFloor?: number;
  floorLabels?: Record<number, string>; // e.g. {1: 'Chặng 1', 2: 'Chặng 2'}
  /**
   * selectionKey determines which field is used to match against selectedSeats.
   * 'seatId' (default) uses display seat code (may duplicate across trips/legs).
   * 'id' uses backend numeric id (unique per seat in API layer).
   * 'auto' prefers backend id if present else falls back to seatId.
   */
  selectionKey?: 'seatId' | 'id' | 'auto';
  /**
   * externalLockedSeatIds: string ids (backend seat id) that are currently locked by others.
   * These will be rendered as unavailable to avoid conflicts.
   */
  externalLockedSeatIds?: Set<string>;
}

const SeatMap: React.FC<SeatMapProps> = ({
  seats,
  onSeatClick,
  selectedSeats = [],
  maxSeats = 4,
  showLegend = true,
  compact = false,
  disabled = false,
  floorDisplay = 'all',
  initialFloor,
  floorLabels,
  selectionKey = 'seatId',
  externalLockedSeatIds
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeFloor, setActiveFloor] = React.useState<number | undefined>(initialFloor);

  // Group seats by floor
  const seatsByFloor = seats.reduce((acc, seat) => {
    if (!acc[seat.floorIndex]) {
      acc[seat.floorIndex] = [];
    }
    acc[seat.floorIndex].push(seat);
    return acc;
  }, {} as Record<number, SeatData[]>);

  Object.keys(seatsByFloor).forEach(floorIndex => {
    seatsByFloor[Number(floorIndex)].sort((a, b) => {
      if (a.rowIndex !== b.rowIndex) {
        return a.rowIndex - b.rowIndex;
      }
      return a.columnIndex - b.columnIndex;
    });
  });

  // Determine floors to render based on mode
  const availableFloors = Object.keys(seatsByFloor)
    .map(n => Number(n))
    .sort((a, b) => a - b);
  React.useEffect(() => {
    if (floorDisplay === 'toggle' && activeFloor === undefined && availableFloors.length) {
      setActiveFloor(availableFloors[0]);
    }
  }, [floorDisplay, activeFloor, availableFloors.join(',')]);

  // Resolve selection identity key for a seat
  const resolveKey = React.useCallback((seat: SeatData) => {
    if (selectionKey === 'id') return seat.id !== undefined ? String(seat.id) : seat.seatId;
    if (selectionKey === 'auto') return seat.id !== undefined ? String(seat.id) : seat.seatId;
    return seat.seatId; // 'seatId'
  }, [selectionKey]);

  // Color logic (priority: selected > booked > available)
  const getSeatColor = (seat: SeatData) => {
    if (!seat.isSeat) return 'transparent';
    if (selectedSeats.includes(resolveKey(seat))) return theme.palette.primary.main;
    const externallyLocked = externalLockedSeatIds?.has(String(seat.id ?? seat.seatId));
    if (!seat.isAvailable || externallyLocked) return theme.palette.error.main; // Booked or locked
    return theme.palette.success.main; // Available
  };

  const getSeatIcon = (seat: SeatData) => {
    if (!seat.isSeat) {
      return (
        <Typography
          variant="caption"
          sx={{
            fontSize: compact ? 12 : 14,
            lineHeight: 1,
            color: 'text.disabled',
            fontWeight: 600,
            userSelect: 'none'
          }}
        >
          -
        </Typography>
      );
    }
    return <EventSeat sx={{ fontSize: compact ? 16 : 20 }} />;
  };

  const handleSeatClick = (seat: SeatData) => {
    if (disabled || !onSeatClick || !seat.isSeat) return;
    
    // Check if seat is already selected
  const isSelected = selectedSeats.includes(resolveKey(seat));
    
    // If trying to select and already at max, don't allow
    if (!isSelected && selectedSeats.length >= maxSeats) return;
    
    onSeatClick(seat);
  };

  const renderFloor = (floorIndex: number, floorSeats: SeatData[]) => {
    // Group seats by row
    const seatsByRow = floorSeats.reduce((acc, seat) => {
      if (!acc[seat.rowIndex]) acc[seat.rowIndex] = [];
      acc[seat.rowIndex].push(seat);
      return acc;
    }, {} as Record<number, SeatData[]>);

    const sortedRows = Object.keys(seatsByRow)
      .map(n => Number(n))
      .sort((a, b) => a - b);

    // Determine max column to build full grid including gaps/aisles
    const maxColumn = floorSeats.reduce((m, s) => Math.max(m, s.columnIndex), 0);

    // Detect row letter offset (some APIs start rowIndex=1 but seatId begins at B)
    // Compute majority offset among rows that have seatId starting with letter
    const offsets: number[] = [];
    sortedRows.forEach(r => {
      const seatWithId = seatsByRow[r].find(s => s.seatId && /^[A-Z]/i.test(s.seatId));
      if (seatWithId) {
        const letter = seatWithId.seatId.charAt(0).toUpperCase();
        const letterPos = letter.charCodeAt(0) - 64; // A=1
        const offset = letterPos - r; 
        offsets.push(offset);
      }
    });
    let inferredOffset = 0;
    if (offsets.length) {
      // Use mode
      const freq: Record<number, number> = {};
      offsets.forEach(o => { freq[o] = (freq[o] || 0) + 1; });
      inferredOffset = Object.entries(freq).sort((a,b)=>b[1]-a[1])[0][0] as unknown as number;
      // Safeguard: if applying offset causes duplicate row labels (merge), revert to 0
      const labels = sortedRows.map(r => String.fromCharCode(64 + r + inferredOffset));
      const set = new Set(labels);
      if (set.size !== labels.length) {
        inferredOffset = 0;
      }
    }

    // Debug logging (only in development) to trace seat grid construction
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      try {
        console.log('🧩 SeatMap debug floor build:', {
          floorIndex,
          providedSeatCount: floorSeats.length,
          distinctRows: sortedRows.length,
          maxColumn,
          inferredOffset,
          sampleFirstRow: seatsByRow[sortedRows[0]]?.map(s=>({c:s.columnIndex,isSeat:s.isSeat,id:s.seatId}))
        });
      } catch {}
    }

    return (
      <Box key={floorIndex} sx={{ mb: compact ? 1 : 2 }}>
        {Object.keys(seatsByFloor).length > 1 && (
          <Typography 
            variant={compact ? "caption" : "body2"} 
            sx={{ 
              mb: 1, 
              fontWeight: 600, 
              color: 'text.secondary',
              textAlign: 'center'
            }}
          >
            Tầng {floorIndex}
          </Typography>
        )}
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: compact ? 0.5 : 1,
          alignItems: 'center'
        }}>
          {sortedRows.map(rowIndex => {
            const rowSeats = seatsByRow[rowIndex];
            const numericRowIndex = rowIndex;
            // --- Row label sanitization ---
            // Original logic tried to infer an alphanumeric offset from seatId letters which could
            // yield large char codes and strange Unicode (e.g. ʌ, ʖ, ʠ). We constrain labels to
            // spreadsheet style A, B, C ... Z, AA, AB ... based on visual order instead.
            const orderIndex = sortedRows.indexOf(rowIndex); // 0-based visual order
            const indexToLetters = (n: number) => {
              let s = '';
              let x = n + 1; // convert to 1-based
              while (x > 0) {
                const mod = (x - 1) % 26;
                s = String.fromCharCode(65 + mod) + s;
                x = Math.floor((x - 1) / 26);
              }
              return s;
            };
            // Try original inferred letter if it's within A-Z; otherwise fallback to sequence mapping.
            const tentativeCode = 64 + numericRowIndex + inferredOffset;
            const rowLabel = (tentativeCode >= 65 && tentativeCode <= 90)
              ? String.fromCharCode(tentativeCode)
              : indexToLetters(orderIndex);
            
            return (
              <Box key={rowIndex} sx={{ display: 'flex', alignItems: 'center', gap: compact ? 0.5 : 1 }}>
                <Typography 
                  variant={compact ? "caption" : "body2"} 
                  sx={{ 
                    minWidth: compact ? 16 : 20, 
                    textAlign: 'center',
                    fontWeight: 600,
                    color: 'text.secondary'
                  }}
                >
                  {rowLabel}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: compact ? 0.5 : 1 }}>
                  {Array.from({ length: maxColumn }, (_, idx) => idx + 1).map(col => {
                    const seat = rowSeats.find(s => s.columnIndex === col) || {
                      seatId: `gap-${floorIndex}-${numericRowIndex}-${col}`,
                      isAvailable: false,
                      isSeat: false,
                      floorIndex,
                      rowIndex: numericRowIndex,
                      columnIndex: col,
                    } as SeatData;
                    const key = seat.id !== undefined ? `${floorIndex}-${seat.id}` : `${floorIndex}-${numericRowIndex}-${col}`;
                    const externallyLocked = externalLockedSeatIds?.has(String(seat.id ?? seat.seatId));
                    const clickable = seat.isSeat && seat.isAvailable && !externallyLocked && !disabled;
                    return (
                      <Box
                        key={key}
                        onClick={() => clickable && handleSeatClick(seat)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: compact ? 24 : 32,
                          height: compact ? 24 : 32,
                          borderRadius: 1,
                          cursor: clickable ? 'pointer' : 'default',
                          bgcolor: getSeatColor(seat),
                          color: seat.isSeat ? 'white' : 'text.disabled',
                          border: seat.isSeat ? `1px solid ${selectedSeats.includes(resolveKey(seat)) ? theme.palette.primary.dark : theme.palette.divider}` : '1px dashed transparent',
                          transition: 'all 0.15s ease',
                          '&:hover': clickable ? {
                            transform: 'scale(1.08)',
                            boxShadow: theme.shadows[2],
                          } : {},
                          opacity: disabled ? 0.5 : 1,
                          position: 'relative'
                        }}
                      >
                        {getSeatIcon(seat)}
                        {seat.isSeat && (!seat.isAvailable || externallyLocked) && (
                          <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 1, pointerEvents: 'none' }} />
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      p: compact ? 1 : 2,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 2,
      bgcolor: 'background.paper'
    }}>
      {showLegend && (
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          mb: 2, 
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <Box key="available" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <EventSeat sx={{ fontSize: 16, color: theme.palette.success.main }} />
            <Typography variant="caption">Còn trống</Typography>
          </Box>
          <Box key="booked" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <EventSeat sx={{ fontSize: 16, color: theme.palette.error.main }} />
            <Typography variant="caption">Đã đặt</Typography>
          </Box>
          <Box key="selected" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <EventSeat sx={{ fontSize: 16, color: theme.palette.primary.main }} />
            <Typography variant="caption">Đã chọn</Typography>
          </Box>
          <Box key="aisle" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Remove sx={{ fontSize: 16, color: 'text.disabled' }} />
            <Typography variant="caption">Lối đi</Typography>
          </Box>
        </Box>
      )}

      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        gap: 2,
        alignItems: 'center'
      }}>
        {floorDisplay === 'toggle' && availableFloors.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {availableFloors.map(floor => (
              <Chip
                key={floor}
                label={floorLabels?.[floor] || `Tầng ${floor}`}
                color={activeFloor === floor ? 'primary' : 'default'}
                onClick={() => !disabled && setActiveFloor(floor)}
                sx={{ cursor: disabled ? 'default' : 'pointer' }}
              />
            ))}
          </Box>
        )}

        {(floorDisplay === 'toggle' && activeFloor !== undefined
          ? [activeFloor]
          : availableFloors
        ).map(floorIndex => (
          renderFloor(Number(floorIndex), seatsByFloor[Number(floorIndex)])
        ))}
      </Box>

      {maxSeats > 1 && (
        <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary', textAlign: 'center' }}>
          Đã chọn {selectedSeats.length}/{maxSeats} ghế
        </Typography>
      )}
    </Box>
  );
};

export default SeatMap;
