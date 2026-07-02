package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type SuccessResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Meta    interface{} `json:"meta,omitempty"`
}

type ErrorResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
	Code    string `json:"code,omitempty"`
}

// JSON sends a standard success JSON response
func JSON(c *gin.Context, status int, message string, data interface{}, meta interface{}) {
	c.JSON(status, SuccessResponse{
		Success: true,
		Message: message,
		Data:    data,
		Meta:    meta,
	})
}

// Error sends a standard error JSON response
func Error(c *gin.Context, status int, errMessage string, errCode string) {
	c.JSON(status, ErrorResponse{
		Success: false,
		Error:   errMessage,
		Code:    errCode,
	})
	c.Abort()
}
