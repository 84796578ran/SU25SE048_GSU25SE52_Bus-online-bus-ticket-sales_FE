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
}

const SeatMap: React.FC<SeatMapProps> = ({
  seats,
  onSeatClick,
  selectedSeats = [],
  maxSeats = 4,
  showLegend = true,
  compact = false,
  disabled = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Group seats by floor
  const seatsByFloor = seats.reduce((acc, seat) => {
    if (!acc[seat.floorIndex]) {
      acc[seat.floorIndex] = [];
    }
    acc[seat.floorIndex].push(seat);
    return acc;
  }, {} as Record<number, SeatData[]>);

  // Sort seats by row and column
  Object.keys(seatsByFloor).forEach(floorIndex => {
    seatsByFloor[Number(floorIndex)].sort((a, b) => {
      if (a.rowIndex !== b.rowIndex) {
        return a.rowIndex - b.rowIndex;
      }
      return a.columnIndex - b.columnIndex;
    });
  });

  const getSeatColor = (seat: SeatData) => {
    if (!seat.isSeat) return 'transparent';
    if (selectedSeats.includes(seat.seatId)) return theme.palette.primary.main;
    if (!seat.isAvailable) return theme.palette.error.main;
    return theme.palette.success.main;
  };

  const getSeatIcon = (seat: SeatData) => {
    if (!seat.isSeat) return <Remove sx={{ fontSize: compact ? 16 : 20, color: 'text.disabled' }} />;
    return <EventSeat sx={{ fontSize: compact ? 16 : 20 }} />;
  };

  const handleSeatClick = (seat: SeatData) => {
    if (disabled || !onSeatClick || !seat.isSeat) return;
    
    // Check if seat is already selected
    const isSelected = selectedSeats.includes(seat.seatId);
    
    // If trying to select and already at max, don't allow
    if (!isSelected && selectedSeats.length >= maxSeats) return;
    
    onSeatClick(seat);
  };

  const renderFloor = (floorIndex: number, floorSeats: SeatData[]) => {
    // Group seats by row
    const seatsByRow = floorSeats.reduce((acc, seat) => {
      if (!acc[seat.rowIndex]) {
        acc[seat.rowIndex] = [];
      }
      acc[seat.rowIndex].push(seat);
      return acc;
    }, {} as Record<number, SeatData[]>);

    // Sort rows
    const sortedRows = Object.keys(seatsByRow).sort((a, b) => Number(a) - Number(b));

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
            const rowSeats = seatsByRow[Number(rowIndex)];
            const rowLabel = String.fromCharCode(65 + Number(rowIndex) - 1); // A, B, C, etc.
            
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
                  {rowSeats.map((seat, seatIndex) => (
                    <Box
                      key={`${floorIndex}-${seat.rowIndex}-${seat.columnIndex}-${seatIndex}`}
                      onClick={() => handleSeatClick(seat)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: compact ? 24 : 32,
                        height: compact ? 24 : 32,
                        borderRadius: 1,
                        cursor: seat.isSeat && !disabled ? 'pointer' : 'default',
                        bgcolor: getSeatColor(seat),
                        color: seat.isSeat ? 'white' : 'text.disabled',
                        border: seat.isSeat ? `1px solid ${theme.palette.divider}` : 'none',
                        transition: 'all 0.2s ease',
                        '&:hover': seat.isSeat && !disabled ? {
                          transform: 'scale(1.1)',
                          boxShadow: theme.shadows[2],
                        } : {},
                        opacity: disabled ? 0.6 : 1,
                      }}
                    >
                      {getSeatIcon(seat)}
                    </Box>
                  ))}
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
        {Object.keys(seatsByFloor).sort((a, b) => Number(a) - Number(b)).map(floorIndex => 
          renderFloor(Number(floorIndex), seatsByFloor[Number(floorIndex)])
        )}
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
